"""Train the ELA CNN. The test split is never loaded here."""

import argparse
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader

import config
from src.dataset import DatasetError, ElaManifestDataset, load_manifest, records_for_split
from src.model import build_model
from src.utils import ensure_dir, set_seed, write_json


def run_epoch(model, loader, criterion, optimizer, device):
    training = optimizer is not None
    model.train(training)
    total_loss = 0.0
    total_correct = 0.0
    total = 0
    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)
        if training:
            optimizer.zero_grad(set_to_none=True)
        with torch.set_grad_enabled(training):
            logits = model(images)
            loss = criterion(logits, labels)
            if training:
                loss.backward()
                optimizer.step()
        batch = labels.shape[0]
        total += batch
        total_loss += float(loss.item()) * batch
        predictions = (torch.sigmoid(logits) >= config.DECISION_THRESHOLD).float()
        total_correct += float((predictions == labels).sum().item())
    return total_loss / total, total_correct / total


def train(
    manifest_path=None,
    checkpoint_path=None,
    history_path=None,
    epochs: int = config.EPOCHS,
    batch_size: int = config.BATCH_SIZE,
    learning_rate: float = config.LEARNING_RATE,
    patience: int = config.EARLY_STOPPING_PATIENCE,
    seed: int = config.SEED,
) -> dict:
    set_seed(seed)
    frame = load_manifest(manifest_path)
    train_records = records_for_split(frame, "train")
    val_records = records_for_split(frame, "val")
    if not train_records or not val_records:
        raise DatasetError("Training needs both a train split and a val split in the manifest.")
    train_loader = DataLoader(
        ElaManifestDataset(train_records, train=True),
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
    )
    val_loader = DataLoader(
        ElaManifestDataset(val_records, train=False),
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
    )
    device = torch.device("cpu")
    model = build_model()
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate, weight_decay=config.WEIGHT_DECAY)
    checkpoint_path = config.CHECKPOINT_PATH if checkpoint_path is None else checkpoint_path
    history_path = config.HISTORY_PATH if history_path is None else history_path
    ensure_dir(checkpoint_path.parent)
    history = {"epochs": [], "best_epoch": None, "best_val_loss": None, "stopped_early": False}
    best_loss = float("inf")
    best_state = None
    best_epoch = None
    wait = 0
    for epoch in range(1, epochs + 1):
        train_loss, train_acc = run_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = run_epoch(model, val_loader, criterion, None, device)
        row = {
            "epoch": epoch,
            "train_loss": train_loss,
            "train_accuracy": train_acc,
            "val_loss": val_loss,
            "val_accuracy": val_acc,
        }
        history["epochs"].append(row)
        print(
            f"epoch={epoch} train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}"
        )
        if val_loss < best_loss:
            best_loss = val_loss
            best_epoch = epoch
            best_state = {key: value.detach().cpu().clone() for key, value in model.state_dict().items()}
            wait = 0
            torch.save(
                {
                    "state_dict": best_state,
                    "epoch": epoch,
                    "val_loss": val_loss,
                    "image_size": config.IMAGE_SIZE,
                    "dropout": config.DROPOUT,
                    "ela_quality": config.ELA_QUALITY,
                    "ela_scale": config.ELA_SCALE,
                },
                checkpoint_path,
            )
        else:
            wait += 1
            if wait >= patience:
                history["stopped_early"] = True
                print(f"early_stopping epoch={epoch} patience={patience}")
                break
    history["best_epoch"] = best_epoch
    history["best_val_loss"] = best_loss
    history["checkpoint"] = checkpoint_path.name
    write_json(history_path, history)
    return history


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the forgery CNN on the train split.")
    parser.add_argument("--manifest", type=Path, default=config.MANIFEST_PATH)
    parser.add_argument("--checkpoint", type=Path, default=config.CHECKPOINT_PATH)
    parser.add_argument("--history", type=Path, default=config.HISTORY_PATH)
    parser.add_argument("--epochs", type=int, default=config.EPOCHS)
    parser.add_argument("--batch-size", type=int, default=config.BATCH_SIZE)
    parser.add_argument("--lr", type=float, default=config.LEARNING_RATE)
    parser.add_argument("--patience", type=int, default=config.EARLY_STOPPING_PATIENCE)
    parser.add_argument("--seed", type=int, default=config.SEED)
    args = parser.parse_args()
    train(
        manifest_path=args.manifest,
        checkpoint_path=args.checkpoint,
        history_path=args.history,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        patience=args.patience,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
