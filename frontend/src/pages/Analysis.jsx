import { useState } from "react";
import { analyzeImage } from "../api";

const ALLOWED = ["image/jpeg", "image/png", "image/bmp", "image/tiff"];

export default function Analysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function takeFile(next) {
    setResult(null);
    setError("");
    if (!next) {
      setFile(null);
      setPreview("");
      return;
    }
    const allowedExt = /\.(jpe?g|png|bmp|tiff?)$/i.test(next.name);
    if (!ALLOWED.includes(next.type) && !allowedExt) {
      setFile(null);
      setPreview("");
      setError("Choose a JPG, PNG, BMP, or TIFF image.");
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      setError("That file is larger than 10 MB.");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function onAnalyze() {
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await analyzeImage(file));
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const manipulated = result?.predicted_class === "Potentially Manipulated";

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">Image Analysis</p>
        <h1>Inspect one upload</h1>
        <p className="lede">
          The class and score come only from the FastAPI model. Nothing is decided in the browser.
        </p>
      </header>

      <div
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          takeFile(event.dataTransfer.files?.[0]);
        }}
      >
        <p>Drag an image here, or choose a file.</p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.bmp,.tif,.tiff,image/jpeg,image/png,image/bmp,image/tiff"
          onChange={(event) => takeFile(event.target.files?.[0])}
        />
        {file && <p className="mono">{file.name}</p>}
        <button type="button" className="primary" onClick={onAnalyze} disabled={loading || !file}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && <p className="banner banner-error">{error}</p>}
      {loading && <p className="banner">Running ELA and the CNN on the CPU…</p>}

      {(preview || result) && (
        <div className="compare">
          <article className="card">
            <h2>Original</h2>
            {preview ? <img src={preview} alt="Uploaded original" /> : <p>No preview yet.</p>}
          </article>
          <article className="card">
            <h2>ELA</h2>
            {result ? (
              <img
                src={`data:image/png;base64,${result.ela_png_base64}`}
                alt="Error level analysis of the upload"
              />
            ) : (
              <p>ELA appears after a successful analysis.</p>
            )}
          </article>
        </div>
      )}

      {result && (
        <article className="card result-card">
          <p className={`pill ${manipulated ? "pill-bad" : "pill-ok"}`}>{result.predicted_class}</p>
          <p className="mono">Model score: {result.model_score.toFixed(4)}</p>
          <p>{result.score_label}</p>
          <p>{result.explanation}</p>
          <p className="disclaimer">
            Educational output only. ELA highlights compression inconsistencies. It is not proof
            that a file was forged, and this tool does not localize edits pixel by pixel.
          </p>
        </article>
      )}
    </section>
  );
}
