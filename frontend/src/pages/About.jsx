export default function About() {
  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">About</p>
        <h1>Problem and method</h1>
      </header>
      <article className="card">
        <h2>Problem</h2>
        <p>
          Edited photos can be hard to spot by eye. This student project asks a narrower question:
          after Error Level Analysis, can a small network tell CASIA authentic images from CASIA
          tampered images more often than chance?
        </p>
      </article>
      <article className="card">
        <h2>Objectives</h2>
        <ul>
          <li>Prepare a labeled CASIA 2.0 subset with a documented train, validation, and test split.</li>
          <li>Compute ELA the same way during training and during upload analysis.</li>
          <li>Train one CNN on CPU and report held-out metrics only after evaluation is run.</li>
        </ul>
      </article>
      <article className="card">
        <h2>Dataset</h2>
        <p>
          CASIA 2.0 contains authentic images (Au) and tampered images (Tp). Corrected ground-truth
          masks are available separately and are excluded from training because they are annotations,
          not photographs. This repository does not download the dataset for you.
        </p>
      </article>
      <article className="card">
        <h2>ELA</h2>
        <p>
          The image is loaded as RGB, resaved as JPEG at quality 90 in memory, and subtracted from
          the original. The absolute difference is multiplied by 15 and clipped to 0–255. Flat
          images, where the difference is zero, stay black instead of being divided by zero. Bright
          ELA regions mean the pixels changed more when compressed again. That happens for some
          splices, and also for ordinary recompression.
        </p>
      </article>
      <article className="card">
        <h2>CNN</h2>
        <p>
          Input is a 128×128, 3-channel ELA tensor normalized with mean 0.5 and standard deviation
          0.5. Convolution blocks use 16, 32, and 64 filters, each followed by ReLU and max pooling.
          Adaptive average pooling reduces the map to a vector, dropout is applied, and one linear
          unit outputs a logit. Training uses BCEWithLogitsLoss and Adam. The sigmoid of the logit
          is shown as a model score. It is not described as a calibrated probability.
        </p>
      </article>
      <article className="card">
        <h2>Technology</h2>
        <p>
          Python, PyTorch on CPU, FastAPI, Pillow, NumPy, Pandas, Matplotlib, and scikit-learn.
          The interface is React and Vite. No pretrained weights, transformers, or external vision
          APIs are used.
        </p>
      </article>
      <article className="card">
        <h2>Limitations and future work</h2>
        <ul>
          <li>The model does not mark which pixels were edited.</li>
          <li>It cannot detect every manipulation, especially edits that are resaved cleanly.</li>
          <li>Filename grouping reduces one CASIA leakage path. It does not prove the splits are fully independent.</li>
          <li>A larger study could add calibration, error analysis by tamper type, and a stronger baseline.</li>
        </ul>
      </article>
    </section>
  );
}
