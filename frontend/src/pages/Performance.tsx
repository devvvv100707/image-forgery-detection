import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ConfusionMatrix } from "../components/ConfusionMatrix";
import { DataTable } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { Toast } from "../components/Toast";
import { getMetrics, type MetricsPayload } from "../lib/api";
import { USE_MOCKS } from "../lib/config";
import { accuracySeries, lossSeries, mockClassRows, mockConfusion, mockKpis } from "../mocks/fixtures";

function formatPercent(value: unknown) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "Pending";
}

export default function Performance() {
  const [toast, setToast] = useState<string | null>(null);
  const [live, setLive] = useState<MetricsPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (USE_MOCKS) return;
    getMetrics()
      .then(setLive)
      .catch(() => setError("Metrics could not be loaded."));
  }, []);

  const pending = !USE_MOCKS && live?.status !== "complete";
  const metrics = (live?.metrics ?? {}) as Record<string, number>;
  const matrix = (live?.metrics as { confusion_matrix?: number[][] } | null)?.confusion_matrix;
  const kpis = USE_MOCKS
    ? mockKpis
    : [
        { key: "accuracy", label: "Overall Accuracy", value: formatPercent(metrics.accuracy), formula: "(TP + TN) / (TP + TN + FP + FN)" },
        { key: "precision", label: "Precision (Positive)", value: formatPercent(metrics.precision), formula: "TP / (TP + FP)" },
        { key: "recall", label: "Recall / Sensitivity", value: formatPercent(metrics.recall), formula: "TP / (TP + FN)" },
        { key: "f1", label: "Harmonic F1-Score", value: formatPercent(metrics.f1), formula: "2PR / (P + R)" },
      ];

  const history = live?.history?.epochs?.map((row) => ({
    epoch: row.epoch,
    train: row.train_accuracy,
    val: row.val_accuracy,
    trainLoss: row.train_loss,
    valLoss: row.val_loss,
  }));

  function exportJson() {
    const payload = USE_MOCKS
      ? { source: "demo-fixture", note: "Not a measured evaluation.", kpis: mockKpis, confusion: mockConfusion }
      : live ?? { status: "pending" };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = USE_MOCKS ? "demo-evaluation-metrics.json" : "evaluation-metrics.json";
    link.click();
    URL.revokeObjectURL(url);
    setToast("File generation complete");
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-slate-500">EVALUATION PROTOCOL 4.2 · Dataset: CASIA 2.0 Dual Split · PyTorch 2.2 · ResNet-50</p>
          <h1 className="text-headline-xl">Model Performance & Evaluation</h1>
          <p className="max-w-3xl text-body-md text-slate-600">
            Validation metrics, convergence loss gradients, empirical confusion matrix, and benchmark diagnostics on CASIA 2.0 evaluation split (2,520 balanced holdout samples).
          </p>
          {USE_MOCKS && <p className="mt-2 text-body-sm text-indeterminate-text">These 92.x% figures are demo fixtures. They are hidden in live mode until an evaluation file exists.</p>}
          {pending && <p className="mt-2 rounded-control border border-indeterminate-border bg-indeterminate-bg p-3 text-body-sm">{live?.message || error || "Evaluation pending."}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportJson}>Export Full Report (JSON)</Button>
          <Button onClick={() => setToast(USE_MOCKS ? "Demo only. The browser does not retrain or re-evaluate." : "Run python -m src.evaluate in the backend. This button does not start training.")}>Re-Evaluate Test Set</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ key, ...kpi }) => (
          <KpiCard key={key} {...kpi} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-headline-md">Accuracy Convergence Curve</h2>
          <p className="text-body-sm text-slate-500">{USE_MOCKS ? "Epoch 1–30 comparison between Training (94.8%) and Test Validation (92.4%). Demo series." : "Train and validation accuracy from history.json."}</p>
          <div className="h-64">
            {(USE_MOCKS || (history && history.length > 0)) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={USE_MOCKS ? accuracySeries : history}>
                  <CartesianGrid stroke="#E2E8F0" />
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0.5, 1]} />
                  <ChartTooltip />
                  <Line dataKey="train" stroke="#2563EB" dot={false} name="Training" />
                  <Line dataKey="val" stroke="#4F46E5" dot={false} name="Validation" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-body-sm text-slate-500">Accuracy history is pending.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="text-headline-md">Categorical Cross-Entropy Loss</h2>
          <p className="text-body-sm text-slate-500">{USE_MOCKS ? "Loss drop 0.69 to 0.09 (Train) and 0.22 (Val). Demo series." : "BCE-with-logits loss from training history."}</p>
          <div className="h-64">
            {(USE_MOCKS || (history && history.length > 0)) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={USE_MOCKS ? lossSeries : history}>
                  <CartesianGrid stroke="#E2E8F0" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <ChartTooltip />
                  <Line dataKey={USE_MOCKS ? "train" : "trainLoss"} stroke="#EF4444" dot={false} name="Train loss" />
                  <Line dataKey={USE_MOCKS ? "val" : "valLoss"} stroke="#F59E0B" dot={false} name="Val loss" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-body-sm text-slate-500">Loss history is pending.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-headline-md">Confusion Matrix Heatmap</h2>
          <p className="mb-3 text-body-sm text-slate-500">{USE_MOCKS ? "N = 2,520 test samples. Demo counts." : "Held-out test counts from metrics.json."}</p>
          {USE_MOCKS ? (
            <ConfusionMatrix {...mockConfusion} />
          ) : matrix ? (
            <ConfusionMatrix tn={matrix[0][0]} fp={matrix[0][1]} fn={matrix[1][0]} tp={matrix[1][1]} />
          ) : (
            <p className="text-body-sm text-slate-500">Confusion matrix pending.</p>
          )}
        </Card>
        <Card>
          <h2 className="text-headline-md">ROC Curve & AUC Diagnostics</h2>
          <p className="text-body-sm text-slate-600">
            {USE_MOCKS
              ? "The reference screen shows AUC 0.968. This build does not compute a ROC curve from saved scores, so the live page does not invent that curve."
              : "ROC is not stored by the current evaluator. Accuracy, precision, recall, F1, and the confusion matrix are the saved diagnostics."}
          </p>
          {USE_MOCKS && <p className="mt-4 font-mono text-[28px] tabular text-slate-900">0.968</p>}
          {USE_MOCKS && <p className="text-body-sm text-slate-500">Demo AUC label from the reference screen.</p>}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-headline-md">Detailed Class-Wise Evaluation Matrix</h2>
        <p className="mb-3 text-body-sm text-slate-500">Granular diagnostic across CASIA 2.0 tamper subsets. {USE_MOCKS ? "Demo table." : "Filled from class_wise when evaluation exists."}</p>
        {USE_MOCKS ? (
          <DataTable
            columns={["Class Name", "Total Support", "Precision", "Recall (TPR)", "F1-Score", "Specificity", "Inference Latency"]}
            rows={mockClassRows.map((row) => [row.name, row.support, row.precision, row.recall, row.f1, row.specificity, row.latency])}
          />
        ) : pending ? (
          <p className="text-body-sm">Class-wise scores are pending.</p>
        ) : (
          <DataTable
            columns={["Class", "Precision", "Recall", "F1", "Support"]}
            rows={Object.entries((live?.metrics as { class_wise?: Record<string, { precision: number; recall: number; f1: number; support: number }> })?.class_wise ?? {}).map(
              ([name, row]) => [name, row.precision.toFixed(3), row.recall.toFixed(3), row.f1.toFixed(3), String(row.support)]
            )}
          />
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
