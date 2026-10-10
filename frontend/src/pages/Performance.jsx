import { useEffect, useState } from "react";
import { getMetrics, plotUrl } from "../api";

function formatMetric(value) {
  return typeof value === "number" ? value.toFixed(4) : "—";
}

export default function Performance() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMetrics()
      .then((body) => {
        if (active) setPayload(body);
      })
      .catch(() => {
        if (active) setError("Metrics could not be loaded. Check that the backend is running.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = payload?.metrics;
  const pending = payload && payload.status !== "complete";

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">Model Performance</p>
        <h1>Held-out test results</h1>
        <p className="lede">
          Numbers on this page are read from files written by evaluation. If those files are
          missing, the page stays pending instead of showing a placeholder score.
        </p>
      </header>

      {loading && <p className="banner">Loading saved metrics…</p>}
      {error && <p className="banner banner-error">{error}</p>}
      {pending && <p className="banner banner-warn">{payload.message}</p>}

      {metrics && (
        <>
          <div className="grid-3">
            {[
              ["Accuracy", metrics.accuracy],
              ["Precision", metrics.precision],
              ["Recall", metrics.recall],
              ["F1", metrics.f1],
              ["Test loss", metrics.loss],
              ["Test images", metrics.test_samples],
            ].map(([label, value]) => (
              <article className="card metric" key={label}>
                <h2>{label}</h2>
                <p className="metric-value">{typeof value === "number" && label !== "Test images" ? formatMetric(value) : value}</p>
              </article>
            ))}
          </div>

          <article className="card">
            <h2>Test class counts</h2>
            <ul>
              {Object.entries(metrics.test_class_counts || {}).map(([name, count]) => (
                <li key={name}>
                  {name}: {count}
                </li>
              ))}
            </ul>
            <p>
              Precision, recall, and F1 treat <strong>{metrics.positive_class}</strong> as the
              positive class. A false positive is an authentic image called manipulated
              ({metrics.false_positives}). A false negative is a manipulated image called authentic
              ({metrics.false_negatives}).
            </p>
            <p>{metrics.explanation}</p>
          </article>

          <article className="card">
            <h2>Class-wise scores</h2>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.class_wise || {}).map(([name, row]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{formatMetric(row.precision)}</td>
                    <td>{formatMetric(row.recall)}</td>
                    <td>{formatMetric(row.f1)}</td>
                    <td>{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <div className="grid-2">
            {["confusion_matrix.png", "loss_curve.png", "accuracy_curve.png"].map((name) => (
              <article className="card" key={name}>
                <h2>{name.replaceAll("_", " ").replace(".png", "")}</h2>
                <img src={plotUrl(name)} alt={name} />
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
