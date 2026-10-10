import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ParamChip } from "../components/ParamChip";

const citation = "Dong, J., Wang, W., & Tan, T. (2013). CASIA Image Tampering Detection Evaluation Database. Institute of Automation, Chinese Academy of Sciences.";

export default function About() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption uppercase text-brand">Project scope · Third-year B.Tech data science capstone</p>
          <p className="text-body-sm text-slate-500">Supervised by Department of Computer Science & Engineering · Docs-ver: 2024.12-Final</p>
          <h1 className="text-headline-xl">About & Methodology</h1>
          <p className="max-w-3xl text-body-md text-slate-600">Academic project architecture, algorithmic formulation, dataset specifications, and digital forensic limitations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => document.getElementById("cnn-graph")?.scrollIntoView({ behavior: "smooth" })}>Jump to CNN Graph</Button>
          <Button
            variant="mono"
            onClick={async () => {
              await navigator.clipboard.writeText(citation);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy Meta"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-caption uppercase text-slate-500">Module 01 // Domain audit · Priority: High</p>
          <h2 className="text-headline-md">Problem Statement</h2>
          <p className="text-body-md text-slate-600">Digital image manipulation through copy-move, splicing, and deep inpainting compromises digital evidence integrity, journalism, and social forensic timelines.</p>
          <p className="mt-3 rounded-control bg-manipulated-bg p-3 text-body-sm text-manipulated-text">The forensic challenge: localized JPEG quantization tables exhibit hidden thermodynamic and entropy variance shifts.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ParamChip>Copy-Move Splicing</ParamChip>
            <ParamChip>Generative Infill</ParamChip>
            <ParamChip>Entropy Divergence</ParamChip>
          </div>
        </Card>
        <Card>
          <p className="text-caption uppercase text-slate-500">Module 02 // Benchmark corpus · CASIA v2.0</p>
          <h2 className="text-headline-md">Dataset Specifications</h2>
          <p className="text-body-sm text-slate-600">Institute of Automation, Chinese Academy of Sciences (CASIA TIDE v2.0) ground-truth corpus.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-control bg-module p-2"><p className="text-caption">Authentic</p><p className="font-mono text-[20px]">7,491</p></div>
            <div className="rounded-control bg-module p-2"><p className="text-caption">Tampered</p><p className="font-mono text-[20px]">5,123</p></div>
          </div>
          <p className="mt-3 text-body-sm">Split distribution · 12,614 total</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-control">
            <div className="w-[70%] bg-brand" />
            <div className="w-[10%] bg-sky-400" />
            <div className="w-[20%] bg-slate-300" />
          </div>
          <p className="mt-1 font-mono text-[11px]">70% Train (8,829) · 10% Val (1,261) · 20% Test (2,524)</p>
          <p className="mt-2 text-body-sm text-slate-500">This bar matches the reference screen. The runnable config in backend/config.py uses 70/15/15.</p>
        </Card>
        <Card>
          <p className="text-caption uppercase text-slate-500">Module 03 // Physical heuristic · Q-factor 90%</p>
          <h2 className="text-headline-md">ELA Mathematical Pipeline</h2>
          <p className="text-body-sm text-slate-600">Error Level Analysis candidate tensor at controlled JPEG 90% quality to analyze DCT macroblock compression differences.</p>
          <pre className="mt-3 overflow-auto rounded-card bg-slate-900 p-3 font-mono text-[12px] text-indigo-100">{`E(x,y) = |I_orig(x,y) - I_resaved(x,y)| × α
where α = scale factor
(default: 15× for scalar normalization)`}</pre>
          <p className="mt-2 text-body-sm text-slate-600">High-frequency regions compress differently under consecutive transformations. Unmodified areas reach a stable compression equilibrium.</p>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" >
          <div id="cnn-graph">
            <p className="text-caption uppercase text-slate-500">Module 04 // Computational core</p>
            <h2 className="text-headline-md">Deep Learning CNN Architecture</h2>
            <p className="text-body-sm text-slate-600">Feed-forward hierarchical convolutional pipeline trained directly on spatial ELA differential tensors.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ["Input tensor", "128 × 128 × 3 ELA map"],
                ["Conv block 1", "16 filters · 3×3 · MaxPool"],
                ["Conv block 2", "32 filters · 3×3 · MaxPool"],
                ["Conv block 3", "64 filters · pool · 1 logit"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-card border border-line bg-module p-3">
                  <p className="text-caption uppercase text-brand">{title}</p>
                  <p className="font-mono text-[12px]">{body}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-body-sm text-slate-500">Running code uses BCEWithLogitsLoss, Adam, dropout 0.3, and CPU. The reference mockup draws a larger 224-pixel stack; this graph is the network in backend/src/model.py.</p>
          </div>
        </Card>
        <Card>
          <p className="text-caption uppercase text-slate-500">Module 05 // Tech ecosystem</p>
          <h2 className="text-headline-md">Engineering Architecture</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-body-sm text-slate-600">
            <li>Client viewport: React, Vite, Tailwind, typed fetch client.</li>
            <li>Forensic middleware: FastAPI, in-memory uploads, uvicorn.</li>
            <li>Neural computation: PyTorch CPU, Pillow JPEG buffers, NumPy.</li>
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="text-caption uppercase text-slate-500">Module 06 // Forensic constraints & evolution</p>
        <h2 className="text-headline-md">Diagnostic Limitations & Future Roadmap</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-body-md font-semibold text-manipulated-text">Current forensic limitations</h3>
            <ul className="mt-2 space-y-2 text-body-sm text-slate-600">
              <li>Platform re-compression from social apps can erase the quantization trace.</li>
              <li>The model outputs one image-level score. It does not localize pixels.</li>
              <li>Uncompressed inputs lack JPEG quantization tables, so ELA is weak.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-authentic-text">Proposed forensic roadmap</h3>
            <ul className="mt-2 space-y-2 text-body-sm text-slate-600">
              <li>Fixed-level masking or noiseprint-style localization, still without claiming every edit is found.</li>
              <li>EXIF and file-header cross-checks beside the CNN score.</li>
              <li>Adversarial hardening only after a real held-out evaluation exists.</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="mt-4 rounded-card bg-slate-900 p-4 text-slate-200">
        <p className="text-caption uppercase text-slate-400">Academic citation & artifact provenance</p>
        <p className="mt-2 text-body-sm">{citation}</p>
        <p className="mt-2 font-mono text-[11px] text-slate-400">Investigative toolkit // PyTorch + ELA engine · Evaluated on CASIA 2.0 ground truth only after you run evaluation · B.Tech Data Science © 2026</p>
      </div>
    </div>
  );
}
