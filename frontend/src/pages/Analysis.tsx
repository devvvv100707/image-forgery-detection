import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ComparatorSlider } from "../components/ComparatorSlider";
import { ConfidenceBar } from "../components/ConfidenceBar";
import { CopyHash } from "../components/CopyHash";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { Slider } from "../components/Slider";
import { StatusPill } from "../components/StatusPill";
import { predictImage, type PredictResult } from "../lib/api";
import { USE_MOCKS } from "../lib/config";
import { presets } from "../mocks/fixtures";

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function Analysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [hash, setHash] = useState("");
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(10);
  const [split, setSplit] = useState(46);
  const [presetId, setPresetId] = useState<string>("spliced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictResult | null>(USE_MOCKS ? null : null);
  const [zoom, setZoom] = useState(false);
  const [channel, setChannel] = useState("RGB");

  const preset = presets[presetId as keyof typeof presets];

  function takeFile(next: File | null) {
    setError("");
    setResult(null);
    if (!next) {
      setFile(null);
      setPreview("");
      setHash("");
      return;
    }
    const allowed = /\.(jpe?g|png|tiff?)$/i.test(next.name);
    if (!allowed) {
      setError("Upload a JPEG, PNG, or TIFF image.");
      return;
    }
    if (next.size > 15 * 1024 * 1024) {
      setError("The file is larger than 15 MB.");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    sha256(next).then(setHash).catch(() => setHash(""));
  }

  async function run() {
    setLoading(true);
    setError("");
    try {
      const target = file ?? new File([new Uint8Array([0])], preset.fileName, { type: "image/jpeg" });
      const payload = await predictImage(file ?? target, quality, scale);
      setResult(payload);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Inference failed.");
    } finally {
      setLoading(false);
    }
  }

  const score = result?.model_score ?? (USE_MOCKS ? preset.score : 0);
  const manipulated = (result?.predicted_class ?? preset.verdict) === "Potentially Manipulated";
  const elaSrc = result?.ela_png_base64 ? `data:image/png;base64,${result.ela_png_base64}` : "";
  const left = useMemo(() => {
    if (preview) return <img src={preview} alt="Source specimen" className="h-full w-full object-cover" />;
    return <div className="grid h-full place-items-center bg-slate-800 font-mono text-[12px] text-slate-300">Source RGB Domain</div>;
  }, [preview]);
  const right = elaSrc ? (
    <img src={elaSrc} alt="ELA residual" className="h-full w-full object-cover" style={{ filter: channel === "Luma" ? "grayscale(1)" : undefined }} />
  ) : (
    <div className="grid h-full place-items-center bg-black font-mono text-[12px] text-slate-300">Residual ELA Tensor (Scale: {scale}x)</div>
  );

  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-12 flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-full bg-module px-3 py-1 font-mono text-[12px]">SESSION ID: #FRX-8842-PY</p>
        <p className="text-body-sm text-slate-500">{USE_MOCKS ? "FastAPI /predict endpoint ready · demo narrative" : "Live /predict"}</p>
        <p className="font-mono text-[12px] text-slate-500">ENGINE ARCHITECTURE PyTorch ELA-CNN v2.4</p>
      </div>

      <div className="space-y-4 xl:col-span-5">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption uppercase text-slate-500">Verification Test Suite</p>
            <p className="text-body-sm text-brand">Select Preset</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(presets).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPresetId(item.id)}
                className={`rounded-card border p-2 text-left ${presetId === item.id ? "border-brand" : "border-line"}`}
              >
                <p className="font-mono text-[10px] text-slate-400">{item.sample}</p>
                <p className="text-body-sm font-semibold">{item.title}</p>
                <p className={`text-[11px] ${item.verdict.includes("Manipulated") ? "text-manipulated-text" : "text-authentic-text"}`}>{item.verdict.includes("Manipulated") ? "Manipulated" : "Authentic"}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label
            className="grid cursor-pointer place-items-center gap-2 rounded-card border border-dashed border-slate-300 py-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              takeFile(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            <Icon name="cloud_upload" />
            <p className="text-headline-md">Drag and drop an image, or click to browse</p>
            <p className="text-body-sm text-slate-500">Upload suspect photography or digital documents for deep artifact reconstruction.</p>
            <p className="rounded-full border border-line px-3 py-1 text-body-sm">Supported: JPEG, PNG, TIFF (Max 15MB)</p>
            <input className="sr-only" type="file" accept=".jpg,.jpeg,.png,.tif,.tiff" onChange={(event) => takeFile(event.target.files?.[0] ?? null)} />
          </label>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-caption uppercase text-slate-500">Active Specimen Profile</p>
            <StatusPill kind="neutral">In memory</StatusPill>
          </div>
          <p className="font-mono text-[13px]">{file?.name ?? preset.fileName}</p>
          <p className="font-mono text-[11px] text-slate-500">{preset.size}</p>
          <CopyHash value={hash || preset.sha} />
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => document.querySelector<HTMLInputElement>("input[type=file]")?.click()}>Replace File</Button>
            <Button variant="destructive" onClick={() => takeFile(null)}>Purge Specimen</Button>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption uppercase text-slate-500">ELA Hyperparameters</p>
            <p className="font-mono text-[11px]">CV2 JPEG Recompression</p>
          </div>
          <div className="space-y-4">
            <Slider label="JPEG Resave Quality" hint="Target compression baseline for error differentiation" min={50} max={100} value={quality} suffix="%" onChange={setQuality} />
            <Slider label="Scale Factor Multiplier" hint="Magnitude amplifier for residual differences" min={1} max={30} value={scale} suffix="x" onChange={setScale} />
          </div>
          <Button className="mt-4 w-full" onClick={run} disabled={loading}>
            {loading ? "Running inference…" : "Run Forensic Inference"}
          </Button>
          {error && <p className="mt-3 rounded-control border border-manipulated-border bg-manipulated-bg p-2 text-body-sm text-manipulated-text">{error}</p>}
        </Card>
      </div>

      <div className="space-y-4 xl:col-span-7">
        <Card className={manipulated ? "border-manipulated-border bg-manipulated-bg" : "border-authentic-border bg-authentic-bg"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusPill kind={manipulated ? "manipulated" : "authentic"} pulse={manipulated}>
              {result?.predicted_class ?? (USE_MOCKS ? preset.verdict : "Awaiting inference")}
            </StatusPill>
            <p className="font-mono text-[12px]">Latency: {result?.latency_label ?? (USE_MOCKS ? preset.latency : "—")} · PyTorch Engine</p>
          </div>
          <p className="mt-3 font-mono text-[40px] font-medium leading-none tabular">{USE_MOCKS || result ? `${(score * 100).toFixed(1)}%` : "—"}</p>
          <p className="text-caption uppercase text-slate-600">{result?.source === "live" ? "Model score" : "Demo score"}</p>
          <div className="mt-3"><ConfidenceBar value={score} /></div>
          <p className="mt-3 text-body-md">{result?.explanation ?? (USE_MOCKS ? preset.explanation : "Run inference to request a live score. Missing weights return an error instead of a fake class.")}</p>
          {result?.score_label && <p className="mt-2 text-body-sm text-slate-600">{result.score_label}</p>}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption uppercase text-slate-500">Synchronized Inspection Stage · Split-Wipe Comparator</p>
            <div className="flex gap-2">
              <button type="button" aria-label="Zoom" onClick={() => setZoom(true)}><Icon name="open_in_full" /></button>
              <button type="button" aria-label="Channel" onClick={() => setChannel(channel === "RGB" ? "Luma" : "RGB")}><Icon name="tune" /></button>
              <button type="button" aria-label="Reset" onClick={() => { setSplit(50); setChannel("RGB"); }}><Icon name="restart_alt" /></button>
            </div>
          </div>
          <ComparatorSlider left={left} right={right} value={split} onChange={setSplit} />
          <p className="mt-2 text-center text-[11px] uppercase tracking-wide text-slate-500">Drag divider left or right to inspect residual divergence</p>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Mean SQ Error", result?.mean_sq ?? (USE_MOCKS ? preset.meanSq : "—"), "Compression Diff"],
            ["Anomaly Count", result?.anomaly_count ?? (USE_MOCKS ? preset.anomaly : "—"), "Boundary Spikes"],
            ["BCE Confidence", result ? result.model_score.toFixed(3) : USE_MOCKS ? preset.bce : "—", "Sigmoid of logit"],
            ["CNN Backbone", "3-block Conv", "Dropout 0.3"],
          ].map(([label, value, note]) => (
            <Card key={label}>
              <p className="text-caption uppercase text-slate-500">{label}</p>
              <p className="font-mono text-[20px] tabular">{value}</p>
              <p className="text-body-sm text-slate-500">{note}</p>
            </Card>
          ))}
        </div>

        <Card className="bg-module">
          <h2 className="text-headline-md">Forensic Chain of Custody & ELA Limitations</h2>
          <p className="text-body-md text-slate-600">
            Error Level Analysis visualizes compression differences and highlights localized re-saving discrepancies. The CNN evaluates global features learned during training. A score is not judicial proof. Multi-factor checks such as metadata timestamps, color-filter-array interpolation, and lighting consistency are outside this tool.
          </p>
        </Card>
      </div>
      <Modal open={zoom} title="Inspection lightbox" onClose={() => setZoom(false)}>
        <ComparatorSlider left={left} right={right} value={split} onChange={setSplit} />
      </Modal>
    </div>
  );
}
