"""Load a checkpoint and score one image. Does not invent a result."""

import argparse
from pathlib import Path

import torch
from PIL import Image

import config
from src.ela import ElaError, load_rgb, preprocess_image, preview_ela_image
from src.model import build_model


class PredictError(Exception):
    """Prediction could not be completed."""


def load_model(checkpoint_path: Path | None = None):
    path = config.CHECKPOINT_PATH if checkpoint_path is None else checkpoint_path
    if not path.is_file():
        raise PredictError("Model weights are not available. Train the model before analyzing images.")
    try:
        try:
            checkpoint = torch.load(path, map_location="cpu", weights_only=False)
        except TypeError:
            checkpoint = torch.load(path, map_location="cpu")
        model = build_model(dropout=float(checkpoint.get("dropout", config.DROPOUT)))
        model.load_state_dict(checkpoint["state_dict"])
        model.eval()
    except Exception as exc:
        raise PredictError("The checkpoint could not be loaded.") from exc
    return model


def predict_image(image: Image.Image, model=None, checkpoint_path: Path | None = None) -> dict:
    if model is None:
        model = load_model(checkpoint_path)
    try:
        rgb = load_rgb(image)
        tensor = preprocess_image(rgb).unsqueeze(0)
        ela_image = preview_ela_image(rgb)
    except ElaError as exc:
        raise PredictError("The image could not be read.") from exc
    with torch.inference_mode():
        logit = model(tensor)
        score = float(torch.sigmoid(logit).item())
    label_id = config.LABEL_MANIPULATED if score >= config.DECISION_THRESHOLD else config.LABEL_AUTHENTIC
    class_name = config.CLASS_NAMES[label_id]
    if label_id == config.LABEL_MANIPULATED:
        explanation = (
            "The CNN assigned this ELA image to Potentially Manipulated. "
            "The model score is the sigmoid of one logit. It is not a calibrated probability "
            "and it is not proof of forgery. ELA highlights JPEG compression differences, "
            "which can also come from normal saving and resizing."
        )
    else:
        explanation = (
            "The CNN assigned this ELA image to Likely Authentic. "
            "The model score is the sigmoid of one logit. A low score is not proof that "
            "the image is original. Many edits leave little or no ELA difference, and this "
            "model only separates the two classes it was trained on."
        )
    return {
        "predicted_class": class_name,
        "label": label_id,
        "model_score": score,
        "score_label": "sigmoid of the CNN logit (model score, not a calibrated probability)",
        "positive_class": config.CLASS_NAMES[config.LABEL_MANIPULATED],
        "explanation": explanation,
        "ela_image": ela_image,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Score one image with the saved CNN.")
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--checkpoint", type=Path, default=config.CHECKPOINT_PATH)
    args = parser.parse_args()
    if not args.image.is_file():
        raise SystemExit("Image file was not found.")
    try:
        with Image.open(args.image) as image:
            image.load()
            result = predict_image(image, checkpoint_path=args.checkpoint)
    except (PredictError, OSError) as exc:
        raise SystemExit(str(exc)) from exc
    print(f"class={result['predicted_class']}")
    print(f"model_score={result['model_score']:.6f}")
    print(result["score_label"])


if __name__ == "__main__":
    main()
