"""API tests. No full dataset and no claim of a trained project model."""

from pathlib import Path

import pytest
import torch
from fastapi.testclient import TestClient
from PIL import Image

import config
import main
from main import app
from src.model import build_model


@pytest.fixture()
def client():
    return TestClient(app)


def test_health_missing_weights(client, tmp_path, monkeypatch):
    monkeypatch.setattr(config, "CHECKPOINT_PATH", tmp_path / "missing.pt")
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["model_ready"] is False
    assert body["status"] == "not_ready"
    assert "Traceback" not in response.text


def test_analyze_missing_weights(client, tmp_path, monkeypatch):
    monkeypatch.setattr(config, "CHECKPOINT_PATH", tmp_path / "missing.pt")
    image = tmp_path / "tiny.jpg"
    Image.new("RGB", (8, 8), (1, 2, 3)).save(image, format="JPEG")
    with image.open("rb") as handle:
        response = client.post("/api/analyze", files={"file": ("tiny.jpg", handle, "image/jpeg")})
    assert response.status_code == 503
    assert "Traceback" not in response.text


def test_analyze_invalid_upload(client, tmp_path, monkeypatch):
    checkpoint = tmp_path / "model.pt"
    model = build_model(dropout=0.0)
    torch.save({"state_dict": model.state_dict(), "dropout": 0.0}, checkpoint)
    monkeypatch.setattr(config, "CHECKPOINT_PATH", checkpoint)
    response = client.post("/api/analyze", files={"file": ("notes.txt", b"hello", "text/plain")})
    assert response.status_code == 400
    response = client.post(
        "/api/analyze", files={"file": ("photo.jpg", b"not-really-jpeg", "image/jpeg")}
    )
    assert response.status_code == 400


def test_analyze_success_shape(client, tmp_path, monkeypatch):
    checkpoint = tmp_path / "model.pt"
    model = build_model(dropout=0.0)
    torch.save({"state_dict": model.state_dict(), "dropout": 0.0}, checkpoint)
    monkeypatch.setattr(config, "CHECKPOINT_PATH", checkpoint)
    image = tmp_path / "tiny.png"
    Image.new("RGB", (12, 12), (30, 90, 200)).save(image, format="PNG")
    with image.open("rb") as handle:
        response = client.post("/api/analyze", files={"file": ("tiny.png", handle, "image/png")})
    assert response.status_code == 200
    body = response.json()
    assert body["predicted_class"] in config.CLASS_NAMES.values()
    assert 0.0 <= body["model_score"] <= 1.0
    assert body["ela_png_base64"]
    assert "calibrated probability" in body["score_label"]


def test_metrics_pending(client, tmp_path, monkeypatch):
    monkeypatch.setattr(config, "METRICS_PATH", tmp_path / "metrics.json")
    monkeypatch.setattr(config, "HISTORY_PATH", tmp_path / "history.json")
    response = client.get("/api/metrics")
    assert response.status_code == 200
    assert response.json()["status"] == "pending"


def test_plot_name_validation(client, tmp_path, monkeypatch):
    monkeypatch.setattr(config, "EVAL_DIR", tmp_path)
    response = client.get("/api/plots/not_a_plot.png")
    assert response.status_code == 404
    response = client.get("/api/plots/..%2F..%2Fetc%2Fpasswd")
    assert response.status_code == 404
    missing = client.get("/api/plots/loss_curve.png")
    assert missing.status_code == 404


def test_dataset_status_missing(client, tmp_path, monkeypatch):
    monkeypatch.setattr(config, "PREP_REPORT_PATH", tmp_path / "prep_report.json")
    monkeypatch.setattr(config, "MANIFEST_PATH", tmp_path / "manifest.csv")
    response = client.get("/api/dataset/status")
    assert response.status_code == 200
    body = response.json()
    assert body["training_data_ready"] is False
    assert "/workspace" not in response.text
    assert "\\\\" not in response.text or "Users" not in response.text
