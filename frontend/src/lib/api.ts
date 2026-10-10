import { API_BASE, USE_MOCKS } from "./config";
import { mockHealth, presets } from "../mocks/fixtures";

export type Health = {
  status: string;
  model_ready: boolean;
  detail: string;
  connected: boolean;
};

export type PredictResult = {
  predicted_class: string;
  model_score: number;
  score_label: string;
  positive_class: string;
  explanation: string;
  ela_png_base64: string;
  model_ready: boolean;
  ela_quality: number;
  ela_scale: number;
  source: "mock" | "live";
  latency_label?: string;
  mean_sq?: string;
  anomaly_count?: string;
};

export type MetricsPayload = {
  status: string;
  metrics: Record<string, unknown> | null;
  history: { epochs?: Array<Record<string, number>> } | null;
  message: string;
};

async function readError(response: Response) {
  try {
    const body = await response.json();
    if (body && typeof body.detail === "string") return body.detail;
  } catch {
    /* not json */
  }
  return "The server could not complete that request.";
}

export async function getHealth(): Promise<Health> {
  if (USE_MOCKS) return mockHealth;
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error(await readError(response));
    const body = await response.json();
    return { ...body, connected: true };
  } catch {
    return {
      status: "offline",
      model_ready: false,
      detail: "Backend is not reachable.",
      connected: false,
    };
  }
}

export async function getMetrics(): Promise<MetricsPayload> {
  if (USE_MOCKS) {
    return { status: "mock", metrics: null, history: null, message: "Demo metrics are local fixtures." };
  }
  const response = await fetch(`${API_BASE}/api/metrics`);
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function getDatasetStatus(): Promise<Record<string, unknown>> {
  if (USE_MOCKS) return { status: "mock", training_data_ready: false, message: "Demo dataset card." };
  const response = await fetch(`${API_BASE}/api/dataset/status`);
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function predictImage(file: File, quality: number, scale: number): Promise<PredictResult> {
  if (USE_MOCKS) {
    const preset = Object.values(presets).find((item) => item.fileName === file.name) ?? presets.spliced;
    return {
      predicted_class: preset.verdict,
      model_score: preset.score,
      score_label: "Demo narrative score from the reference screen. Not a measured probability.",
      positive_class: "Potentially Manipulated",
      explanation: preset.explanation,
      ela_png_base64: "",
      model_ready: true,
      ela_quality: quality,
      ela_scale: scale,
      source: "mock",
      latency_label: preset.latency,
      mean_sq: preset.meanSq,
      anomaly_count: preset.anomaly,
    };
  }
  const body = new FormData();
  body.append("file", file);
  body.append("quality", String(quality));
  body.append("scale", String(scale));
  const response = await fetch(`${API_BASE}/predict`, { method: "POST", body });
  if (!response.ok) throw new Error(await readError(response));
  const payload = await response.json();
  return { ...payload, source: "live" };
}
