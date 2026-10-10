"""FastAPI app. Starting the server does not train a model."""

import base64
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import config
from src.ela import ElaError, ela_to_png_bytes, load_rgb
from src.predict import PredictError, load_model, predict_image
from src.utils import read_json

app = FastAPI(title="Image Forgery Detection", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ModelService:
    """Cache the checkpoint and reload it when the file mtime changes."""

    def __init__(self):
        self.model = None
        self.mtime = None
        self.ready = False
        self.reason = "checkpoint_missing"

    def refresh(self):
        path = config.CHECKPOINT_PATH
        if not path.is_file():
            self.model = None
            self.mtime = None
            self.ready = False
            self.reason = "checkpoint_missing"
            return
        mtime = path.stat().st_mtime
        if self.model is not None and self.mtime == mtime and self.ready:
            return
        try:
            self.model = load_model(path)
            self.mtime = mtime
            self.ready = True
            self.reason = "ok"
        except PredictError:
            self.model = None
            self.mtime = mtime
            self.ready = False
            self.reason = "checkpoint_unloadable"


service = ModelService()


class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    detail: str


class AnalyzeResponse(BaseModel):
    predicted_class: str
    model_score: float
    score_label: str
    positive_class: str
    explanation: str
    ela_png_base64: str
    model_ready: bool = True
    ela_quality: int
    ela_scale: float


class MetricsResponse(BaseModel):
    status: str
    metrics: dict | None = None
    history: dict | None = None
    message: str


class DatasetStatusResponse(BaseModel):
    status: str
    training_data_ready: bool
    image_count: int = 0
    class_counts: dict = Field(default_factory=dict)
    missing_classes: list[str] = Field(default_factory=list)
    split_counts: dict = Field(default_factory=dict)
    manifest_present: bool = False
    report_present: bool = False
    leakage_notes: list[str] = Field(default_factory=list)
    message: str


def _public_error(status_code: int, detail: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail=detail)


def _health_body() -> HealthResponse:
    service.refresh()
    if service.ready:
        return HealthResponse(status="ok", model_ready=True, detail="Weights loaded.")
    if service.reason == "checkpoint_unloadable":
        return HealthResponse(
            status="not_ready",
            model_ready=False,
            detail="A checkpoint file exists but could not be loaded.",
        )
    return HealthResponse(
        status="not_ready",
        model_ready=False,
        detail="Model weights have not been trained or saved yet.",
    )


@app.get("/api/health", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health():
    return _health_body()


async def _analyze(file: UploadFile, quality: int, scale: float) -> AnalyzeResponse:
    if quality < 1 or quality > 100:
        raise _public_error(400, "JPEG quality must be between 1 and 100.")
    if scale <= 0 or scale > 100:
        raise _public_error(400, "ELA scale must be greater than 0 and at most 100.")
    service.refresh()
    if not service.ready:
        raise _public_error(503, "Model weights are not available. Analysis cannot run yet.")
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    content_type = (file.content_type or "").lower()
    if extension not in config.ALLOWED_EXTENSIONS and content_type not in config.ALLOWED_UPLOAD_TYPES:
        raise _public_error(400, "Upload a JPG, PNG, BMP, or TIFF image.")
    payload = await file.read()
    if not payload:
        raise _public_error(400, "The upload was empty.")
    if len(payload) > config.UPLOAD_MAX_BYTES:
        raise _public_error(413, "The image is larger than the upload limit.")
    try:
        image = load_rgb(payload)
    except ElaError:
        raise _public_error(400, "The file could not be decoded as an image.")
    try:
        result = predict_image(image, model=service.model, quality=quality, scale=scale)
        encoded = base64.b64encode(ela_to_png_bytes(np.asarray(result["ela_image"]))).decode("ascii")
    except PredictError:
        raise _public_error(500, "Inference failed for this image.")
    return AnalyzeResponse(
        predicted_class=result["predicted_class"],
        model_score=result["model_score"],
        score_label=result["score_label"],
        positive_class=result["positive_class"],
        explanation=result["explanation"],
        ela_png_base64=encoded,
        model_ready=True,
        ela_quality=result["ela_quality"],
        ela_scale=result["ela_scale"],
    )


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    quality: int = Form(config.ELA_QUALITY),
    scale: float = Form(config.ELA_SCALE),
):
    return await _analyze(file, quality, scale)


@app.post("/predict", response_model=AnalyzeResponse)
async def predict_alias(
    file: UploadFile = File(...),
    quality: int = Form(config.ELA_QUALITY),
    scale: float = Form(config.ELA_SCALE),
):
    return await _analyze(file, quality, scale)


@app.get("/api/metrics", response_model=MetricsResponse)
def metrics():
    metrics_path = config.METRICS_PATH
    history_path = config.HISTORY_PATH
    history = read_json(history_path) if history_path.is_file() else None
    if not metrics_path.is_file():
        return MetricsResponse(
            status="pending",
            metrics=None,
            history=history,
            message="Evaluation has not been run. Metrics appear after training and evaluation.",
        )
    try:
        saved = read_json(metrics_path)
    except (OSError, ValueError):
        return MetricsResponse(
            status="pending",
            metrics=None,
            history=history,
            message="Saved metrics could not be read.",
        )
    return MetricsResponse(status="complete", metrics=saved, history=history, message="Saved evaluation results.")


@app.get("/api/plots/{plot_name}")
def plots(plot_name: str):
    if plot_name not in config.ALLOWED_PLOTS or "/" in plot_name or "\\" in plot_name or ".." in plot_name:
        raise _public_error(404, "That plot is not available.")
    path = (config.EVAL_DIR / plot_name).resolve()
    if path.parent != config.EVAL_DIR.resolve() or not path.is_file():
        raise _public_error(404, "That plot has not been generated yet.")
    return FileResponse(path, media_type="image/png")


@app.get("/api/dataset/status", response_model=DatasetStatusResponse)
def dataset_status():
    report_path = config.PREP_REPORT_PATH
    manifest_present = config.MANIFEST_PATH.is_file()
    if not report_path.is_file():
        return DatasetStatusResponse(
            status="missing",
            training_data_ready=False,
            manifest_present=manifest_present,
            report_present=False,
            message="Dataset preparation has not been run.",
        )
    try:
        report = read_json(report_path)
    except (OSError, ValueError):
        return DatasetStatusResponse(
            status="missing",
            training_data_ready=False,
            manifest_present=manifest_present,
            message="The preparation report could not be read.",
        )
    summary = report.get("class_summary", {})
    missing = summary.get("missing_classes", [])
    ready = bool(manifest_present and report.get("image_count", 0) > 0 and not missing)
    return DatasetStatusResponse(
        status=report.get("status", "incomplete"),
        training_data_ready=ready,
        image_count=int(report.get("image_count", 0)),
        class_counts=summary.get("class_counts", {}),
        missing_classes=missing,
        split_counts=report.get("split_counts", {}),
        manifest_present=manifest_present,
        report_present=True,
        leakage_notes=report.get("leakage_notes", []),
        message="Preparation report loaded." if ready else "Preparation finished with missing data or classes.",
    )
