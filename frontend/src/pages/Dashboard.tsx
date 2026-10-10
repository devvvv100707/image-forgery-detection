import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ComparatorSlider } from "../components/ComparatorSlider";
import { Icon } from "../components/Icon";
import { ParamChip } from "../components/ParamChip";
import { SegmentedToggle } from "../components/SegmentedToggle";
import { StatusPill } from "../components/StatusPill";
import { getDatasetStatus, getHealth, getMetrics } from "../lib/api";
import { USE_MOCKS } from "../lib/config";
import { mockDashboard } from "../mocks/fixtures";

function SourcePane() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#1e3a5f] p-4 text-white">
      <p className="text-[11px] uppercase">Source Layer</p>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className="h-8 bg-slate-300/80" style={{ background: index % 3 === 0 ? "#94a3b8" : "#e2e8f0" }} />
        ))}
      </div>
      <p className="font-mono text-[11px]">RGB specimen</p>
    </div>
  );
}

function ElaPane() {
  return (
    <div className="flex h-full flex-col justify-between bg-black p-4 text-white">
      <p className="text-[11px] uppercase">ELA Difference Map (Q=90)</p>
      <div className="relative h-40 border border-rose-500/40">
        <div className="absolute left-1/3 top-6 h-16 w-24 border-2 border-rose-500" />
        <p className="absolute bottom-2 left-2 font-mono text-[11px] text-rose-300">ELA Cluster</p>
      </div>
      <p className="font-mono text-[11px]">Residual tensor</p>
    </div>
  );
}

export default function Dashboard() {
  const [mode, setMode] = useState("Split");
  const [split, setSplit] = useState(58);
  const [liveNote, setLiveNote] = useState("");
  const [ready, setReady] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCKS) return;
    Promise.all([getHealth(), getMetrics(), getDatasetStatus()])
      .then(([health, metrics, dataset]) => {
        const metricStatus = metrics.status === "complete" ? "Evaluation file present" : "Evaluation pending";
        const dataReady = dataset.training_data_ready ? "Manifest ready" : "Dataset prep pending";
        setLiveNote(`${health.detail} ${metricStatus}. ${dataReady}.`);
        setReady(health.model_ready ? "Weights loaded" : "Model not ready");
      })
      .catch(() => setLiveNote("Backend is not reachable."));
  }, []);

  const accuracy = USE_MOCKS ? mockDashboard.accuracy : "Pending";
  const f1 = USE_MOCKS ? mockDashboard.f1 : "—";
  const latency = USE_MOCKS ? mockDashboard.latency : "—";
  const count = USE_MOCKS ? mockDashboard.datasetCount : "—";

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-xl">AI-Powered Image Forgery Detection</h1>
          <p className="max-w-3xl text-body-md text-slate-600">
            Deep learning digital forensics using Error Level Analysis (ELA) and Convolutional Neural Networks for compression artifact anomalies.
          </p>
          {!USE_MOCKS && <p className="mt-2 text-body-sm text-slate-500">{liveNote || "Checking backend…"} {ready}</p>}
          {USE_MOCKS && (
            <p className="mt-2 text-body-sm text-indeterminate-text">Demo figures below match the reference workstation. They are not measured results.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Health Check</Button>
          <Link to="/analyze"><Button>Analyze Image</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <p className="text-caption uppercase text-slate-500">Dual-stream architecture · PyTorch ELA-Net ResNet-Backbone</p>
          <h2 className="mt-2 text-headline-lg">Revealing invisible pixel resave differentials with zero ground-truth bias</h2>
          <p className="mt-3 text-body-md text-slate-600">
            Every digital photo undergoes distinct quantization matrices upon saving. When an actor splices or copy-moves external objects into an existing scene, the inserted region retains a foreign error distribution profile. The pipeline isolates high-frequency gradient variances through controlled recompression, feeding residual spatial tensors into a dual-stream CNN classifier.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <p className="text-caption uppercase text-slate-500">Dataset benchmark</p>
              <p className="font-mono text-[22px] tabular">CASIA 2.0</p>
              <p className="text-body-sm text-slate-500">{USE_MOCKS ? mockDashboard.datasetDetail : "Counts appear after prepare_data"}</p>
            </Card>
            <Card>
              <p className="text-caption uppercase text-slate-500">Val accuracy</p>
              <p className="font-mono text-[22px] tabular">{accuracy}</p>
              <p className="font-mono text-[12px] text-slate-500">F1: {f1}</p>
            </Card>
            <Card>
              <p className="text-caption uppercase text-slate-500">Inference latency</p>
              <p className="font-mono text-[22px] tabular">{latency}</p>
              <p className="text-body-sm text-slate-500">{USE_MOCKS ? "1200 PyTorch Engine" : count}</p>
            </Card>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/analyze"><Button>Start Image Analysis</Button></Link>
            <Button variant="secondary">Inspect Sample Artifact</Button>
          </div>
          <p className="mt-3 text-body-sm text-slate-500">Compliant with ISO/IEC 27037 Digital Evidentiary Guidelines for visual anomaly tracing.</p>
        </div>
        <Card className="xl:col-span-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[12px]">{mockDashboard.fileName}</p>
              {USE_MOCKS && <StatusPill kind="manipulated" pulse>{`Tamper Detected ${mockDashboard.tamperPill}`}</StatusPill>}
            </div>
            <SegmentedToggle options={["Split", "Original", "ELA Map", "Anomaly Cluster"]} value={mode} onChange={setMode} />
          </div>
          {mode === "Original" ? <div className="h-72"><SourcePane /></div> : mode === "ELA Map" || mode === "Anomaly Cluster" ? <div className="h-72"><ElaPane /></div> : (
            <ComparatorSlider left={<SourcePane />} right={<ElaPane />} value={split} onChange={setSplit} />
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <ParamChip>Channel: Luminance</ParamChip>
            <ParamChip>Scale: 15.0x</ParamChip>
            <ParamChip>Mosaic: Faster</ParamChip>
          </div>
          <p className="mt-2 text-body-sm text-slate-500">Notice how the building facade exhibits homogenous compression noise, whereas the forged foreground object glows brightly in ELA.</p>
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="verified" />
          <h2 className="text-headline-md">System Verification & Node Telemetry</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["01", "Service connectivity", "FastAPI Backend", USE_MOCKS ? "Unicorn worker running at 0.0.0.0:8000" : liveNote || "Checking", "Latency: 18ms"],
            ["02", "Deep module weights", "ELA-CNN v2.2", USE_MOCKS ? "4.2M parameters loaded on PyTorch 2.2 CUDA" : "CPU checkpoint only. No CUDA requirement.", "Tensors: FP32"],
            ["03", "Benchmarking corpus", "CASIA v2.0", USE_MOCKS ? "7,491 Authentic / 5,123 Tampered images normalized" : "Not loaded until prepare_data", "Splits: 80/20"],
            ["04", "Validation metrics", USE_MOCKS ? "92.4% Accuracy" : "Pending", USE_MOCKS ? "Eval Run #104 completed on 2,520 test images" : "No evaluation file yet", "ROC-AUC: —"],
          ].map(([index, state, title, body, foot]) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-400">{index}</span>
                <StatusPill kind={USE_MOCKS ? "authentic" : "indeterminate"}>{USE_MOCKS ? "Ready" : "Pending"}</StatusPill>
              </div>
              <p className="mt-2 text-caption uppercase text-slate-500">{state}</p>
              <h3 className="text-headline-md">{title}</h3>
              <p className="text-body-sm text-slate-600">{body}</p>
              <p className="mt-2 font-mono text-[11px] text-slate-500">{foot}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-md">Theoretical Foundations of Digital Image Verification</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ["01", "Image Forgery Detection", "Detects structural imperfections including copy-move cloned regions, multi-source splicing compositions, and neural diffusion inpainting."],
            ["02", "Error Level Analysis (ELA)", "Recompresses the candidate image at a baseline 90% JPEG quality index, computing exact pixel delta residuals against the input frame."],
            ["03", "Convolutional Neural Network", "Proprietary multi-layer convolutional feature extractor trained specifically on residual noise patterns."],
            ["04", "Experimental Evaluation", "Standardized forensic validation against CASIA 2.0. Figures on this page are demo values unless live evaluation exists."],
          ].map(([id, title, body]) => (
            <Card key={id}>
              <p className="text-caption uppercase text-brand">Category {id}</p>
              <h3 className="text-headline-md">{title}</h3>
              <p className="text-body-md text-slate-600">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-6">
        <h2 className="text-headline-md">CASIA 2.0 Test Partition Metrics</h2>
        <p className="text-body-sm text-slate-500">{USE_MOCKS ? "Validated over 2,520 independent test frames (20% holdout split). Demo only." : "Shown after python -m src.evaluate writes metrics.json."}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Overall Accuracy", USE_MOCKS ? "92.4%" : "Pending"],
            ["Precision (Tampered)", USE_MOCKS ? "91.8%" : "Pending"],
            ["Recall / Sensitivity", USE_MOCKS ? "93.2%" : "Pending"],
            ["F1 Forensic Score", USE_MOCKS ? "0.918" : "Pending"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-caption uppercase text-slate-500">{label}</p>
              <p className="font-mono text-[22px] tabular">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="mt-4 text-body-sm text-slate-500">
        Forensic Evidentiary Disclaimer: this suite provides automated statistical estimates derived from digital compression artifact anomalies. It is calculated as an investigative triage instrument and does not constitute conclusive legal proof of authenticity.
      </p>
    </div>
  );
}
