/** Reference-screen demo numbers. Not measured evaluation results. */

export const mockHealth = {
  status: "ok" as const,
  model_ready: true,
  detail: "Demo workstation. Weights are not loaded from this flag.",
  connected: true,
};

export const mockDashboard = {
  datasetCount: "12,614",
  datasetDetail: "12,614 verified sets",
  accuracy: "92.4%",
  f1: "0.918",
  latency: "142ms",
  tamperPill: "94.7%",
  fileName: "CASIA2_TAMPER_0042.jpg",
};

export const accuracySeries = [
  { epoch: 1, train: 0.62, val: 0.58 },
  { epoch: 5, train: 0.74, val: 0.71 },
  { epoch: 10, train: 0.84, val: 0.81 },
  { epoch: 15, train: 0.9, val: 0.88 },
  { epoch: 20, train: 0.94, val: 0.91 },
  { epoch: 25, train: 0.96, val: 0.922 },
  { epoch: 30, train: 0.972, val: 0.924 },
];

export const lossSeries = [
  { epoch: 1, train: 0.69, val: 0.71 },
  { epoch: 5, train: 0.48, val: 0.52 },
  { epoch: 10, train: 0.32, val: 0.36 },
  { epoch: 15, train: 0.22, val: 0.27 },
  { epoch: 20, train: 0.16, val: 0.22 },
  { epoch: 25, train: 0.12, val: 0.19 },
  { epoch: 30, train: 0.09, val: 0.18 },
];

export const mockConfusion = {
  tn: 1172,
  fp: 87,
  fn: 86,
  tp: 1175,
};

export const mockKpis = [
  { key: "accuracy", label: "Overall Accuracy", value: "92.4%", delta: "+1.8% vs VGG-16", note: "Baseline (VGG16): 90.6%", formula: "(TP + TN) / (TP + TN + FP + FN)" },
  { key: "precision", label: "Precision (Positive)", value: "91.8%", delta: "FP Rate: 6.9%", note: "Uncompressed FP: -4.1%", formula: "TP / (TP + FP)" },
  { key: "recall", label: "Recall / Sensitivity", value: "93.2%", delta: "1,175 / 1,261 TP", note: "Copy-Move Detect: 94.5%", formula: "TP / (TP + FN)" },
  { key: "f1", label: "Harmonic F1-Score", value: "92.5%", delta: "Macro avg", note: "Weighted: 92.5%", formula: "2PR / (P + R)" },
];

export const mockClassRows = [
  { name: "Authentic (CASIA Au)", support: "1,259", precision: "93.2%", recall: "93.1%", f1: "93.1%", specificity: "93.2%", latency: "18.4 ms / img" },
  { name: "Tampered / Spliced (CASIA Sp)", support: "1,261", precision: "91.8%", recall: "93.2%", f1: "92.5%", specificity: "93.1%", latency: "21.2 ms / img" },
  { name: "Macro / Weighted Average", support: "2,520", precision: "92.5%", recall: "93.2%", f1: "92.8%", specificity: "93.1%", latency: "19.8 ms avg" },
];

export const presets = {
  spliced: {
    id: "spliced",
    title: "Spliced Doc",
    sample: "SAMPLE 01",
    verdict: "Potentially Manipulated" as const,
    score: 0.894,
    latency: "342ms",
    fileName: "test_case_spliced_04.jpg",
    size: "1920×1080 px · 2.4 MB",
    sha: "9f83c1b7e415e89a21b33fa0c6d12e77a91b0e44c2d8f6a1b90e33c71d2a88f4",
    explanation:
      "Anomalous high-frequency error distribution detected around central object boundaries, indicating inconsistent compression history indicative of image splicing.",
    meanSq: "14.82",
    anomaly: "3,410 px",
    bce: "0.894",
  },
  portrait: {
    id: "portrait",
    title: "Auth Portrait",
    sample: "SAMPLE 02",
    verdict: "Likely Authentic" as const,
    score: 0.126,
    latency: "318ms",
    fileName: "portrait_auth_02.jpg",
    size: "1600×1200 px · 1.8 MB",
    sha: "a11c90e2d4b67f0831aa90c77e12b654d0c91e77aa2088c14f90bb2176ee1002",
    explanation:
      "Residual energy is consistent with a single JPEG generation. This demo score is not a measured probability.",
    meanSq: "2.14",
    anomaly: "186 px",
    bce: "0.126",
  },
  copymove: {
    id: "copymove",
    title: "Copy-Move A...",
    sample: "SAMPLE 03",
    verdict: "Potentially Manipulated" as const,
    score: 0.762,
    latency: "361ms",
    fileName: "copy_move_region_03.jpg",
    size: "2048×1536 px · 3.1 MB",
    sha: "c55e01aa98b77120dd44e9012ac77f6510bb9031ee7721aa09c4412b88d01993",
    explanation:
      "Repeated residual clusters appear in two regions. Demo narrative only. ELA does not prove a copy-move.",
    meanSq: "9.40",
    anomaly: "1,204 px",
    bce: "0.762",
  },
};
