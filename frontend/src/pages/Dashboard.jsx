import { useEffect, useState } from "react";
import { getDatasetStatus, getHealth, getMetrics } from "../api";

function Pill({ kind, children }) {
  return <span className={`pill pill-${kind}`}>{children}</span>;
}

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getHealth(), getDatasetStatus(), getMetrics()])
      .then(([healthBody, datasetBody, metricsBody]) => {
        if (!active) return;
        setHealth(healthBody);
        setDataset(datasetBody);
        setMetrics(metricsBody);
      })
      .catch(() => {
        if (active) setError("The backend is not reachable. Start FastAPI, then refresh this page.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1>AI-Powered Image Forgery Detection</h1>
        <p className="lede">
          This project classifies an uploaded image as Likely Authentic or Potentially Manipulated.
          It builds an Error Level Analysis (ELA) image and passes that image through a small
          convolutional network trained from scratch.
        </p>
      </header>

      {loading && <p className="banner">Checking the local backend…</p>}
      {error && <p className="banner banner-error">{error}</p>}

      {health && (
        <div className="grid-3">
          <article className="card">
            <h2>Backend</h2>
            <Pill kind={health.model_ready ? "ok" : "warn"}>
              {health.model_ready ? "Weights loaded" : "Model not ready"}
            </Pill>
            <p>{health.detail}</p>
          </article>
          <article className="card">
            <h2>Dataset</h2>
            <Pill kind={dataset?.training_data_ready ? "ok" : "warn"}>
              {dataset?.training_data_ready ? "Manifest ready" : "Preparation pending"}
            </Pill>
            <p>{dataset?.message}</p>
            {dataset?.image_count > 0 && (
              <p className="mono">Images in manifest: {dataset.image_count}</p>
            )}
          </article>
          <article className="card">
            <h2>Evaluation</h2>
            <Pill kind={metrics?.status === "complete" ? "ok" : "warn"}>
              {metrics?.status === "complete" ? "Metrics saved" : "Results pending"}
            </Pill>
            <p>{metrics?.message}</p>
          </article>
        </div>
      )}

      <div className="grid-2">
        <article className="card">
          <h2>Objective</h2>
          <p>
            Learn whether JPEG compression inconsistencies, made visible by ELA, give a small CNN
            enough signal to separate authentic and tampered images from CASIA 2.0.
          </p>
        </article>
        <article className="card">
          <h2>How the two steps work</h2>
          <p>
            ELA resaves the photo as JPEG and subtracts it from the displayed pixels. Brighter
            areas changed more under that recompression. The CNN sees only this 3-channel ELA
            image, not a claim about every pixel.
          </p>
        </article>
      </div>
    </section>
  );
}
