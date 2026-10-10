# AI-Powered Image Forgery Detection

A college project that classifies an uploaded image as **Likely Authentic** or **Potentially Manipulated**. The pipeline builds an Error Level Analysis (ELA) image and feeds it to a small convolutional network trained from scratch on CPU.

The model does not locate edited pixels, and it does not detect every kind of manipulation. ELA shows JPEG compression differences. Those differences are clues, not proof of forgery.

## 1. Project overview

The backend is FastAPI and PyTorch. The frontend is React and Vite. Training is a separate command. Starting the API does not train a model.

Until you download CASIA 2.0, prepare a manifest, train, and evaluate, the interface reports model weights and metrics as not ready. It does not fill in fake accuracy numbers.

## 2. What the system does

- Converts an image to an ELA picture at JPEG quality 90.
- Classifies that picture with a CNN (convolution blocks 3→16→32→64, one logit).
- Shows the sigmoid of the logit as a **model score**, not as a calibrated probability.
- Serves saved test metrics after evaluation has been run.

## 3. How ELA works

The photo is loaded as RGB, resaved as JPEG in memory, and subtracted from the original. The absolute difference is multiplied by 15 and clipped to 0–255. A flat image with no difference stays black. The same function is used for training and for uploads. Original files are never overwritten.

## 4. CNN

Input size is 128×128 with 3 channels, normalized by mean 0.5 and standard deviation 0.5. Training uses `BCEWithLogitsLoss` and Adam. Only the training split updates weights. The validation split picks the checkpoint (early stopping on validation loss). The test split is used only by evaluation.

Default training settings live in `backend/config.py`: batch size 8, 5 epochs, learning rate 0.001, dropout 0.3, seed 42, early-stopping patience 2.

## 5. Dataset

CASIA 2.0 and the corrected ground-truth masks are not included. See `data/README.md` for the manual download and the folder layout. Masks and annotation images are excluded. Uncertain labels are excluded rather than guessed.

## 6. Project structure

```text
backend/config.py          shared settings
backend/main.py            FastAPI routes
backend/src/ela.py         ELA
backend/src/model.py       CNN
backend/src/dataset.py     manifest dataset
backend/src/prepare_data.py
backend/src/train.py
backend/src/evaluate.py
backend/src/predict.py
backend/tests/             pytest
frontend/src/              React pages
data/raw/                  your extracted CASIA files
data/processed/            manifest and prep report
```

## 7. Configuration

Paths use `pathlib` and are relative to the repository. Change image size, ELA quality, epochs, subset size, split ratios, checkpoint path, and CORS origins in `backend/config.py`.

## 8. Data preparation

After CASIA is extracted under `data/raw`:

```powershell
python -m src.prepare_data
```

Run that command from the `backend` directory. The report lists class counts, missing classes, duplicates, unreadable images, and any source-id links that could not be grouped.

## 9. Training

```powershell
python -m src.train
```

This writes `backend/outputs/checkpoints/best_model.pt` and `backend/outputs/history.json`. It does not read the test split.

## 10. Evaluation

```powershell
python -m src.evaluate
```

This scores the saved checkpoint on the test split and writes `backend/outputs/eval/metrics.json`, CSV and text summaries, and PNG plots. If you have not run it, the API returns status `pending`.

## 11. API

- `GET /api/health` — server status and whether weights load
- `POST /api/analyze` — multipart image upload
- `GET /api/metrics` — saved metrics, or pending
- `GET /api/plots/{plot_name}` — `loss_curve.png`, `accuracy_curve.png`, or `confusion_matrix.png`
- `GET /api/dataset/status` — preparation summary without machine paths

Interactive docs: http://127.0.0.1:8000/docs

## 12. Frontend

Pages: Dashboard, Image Analysis, Model Performance, and About. The analysis page shows the original and the ELA image side by side. Predictions are requested from FastAPI.

Local app: http://127.0.0.1:5173

## 13. Tests

From `backend`:

```powershell
python -m pytest
```

Tests use tiny synthetic images created in temporary folders. Those images are not CASIA samples. A full dataset and a full training run are not required.

## 14. Windows PowerShell setup

Use PowerShell. Commands are separated by `;`.

```powershell
cd C:\path\to\image-forgery-detection
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r backend\requirements.txt
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Leave that window open. In a second PowerShell window:

```powershell
cd C:\path\to\image-forgery-detection\frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173 for the app and http://127.0.0.1:8000/docs for the API.

Dataset, training, and evaluation, still from `backend` with the virtual environment active:

```powershell
python -m src.prepare_data
python -m src.train
python -m src.evaluate
```

`prepare_data` needs the files described in `data/README.md`. Training and evaluation stay pending until those commands finish on your machine. This repository does not ship trained weights.

Backend tests:

```powershell
cd C:\path\to\image-forgery-detection\backend
python -m pytest
```

Frontend production build:

```powershell
cd C:\path\to\image-forgery-detection\frontend
npm run build
```
