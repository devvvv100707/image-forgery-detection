const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function readError(response) {
  try {
    const body = await response.json();
    if (body && typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    /* response was not JSON */
  }
  return "The server could not complete that request.";
}

export async function getHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function getDatasetStatus() {
  const response = await fetch(`${API_BASE}/api/dataset/status`);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function getMetrics() {
  const response = await fetch(`${API_BASE}/api/metrics`);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export function plotUrl(name) {
  return `${API_BASE}/api/plots/${encodeURIComponent(name)}`;
}

export async function analyzeImage(file) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}
