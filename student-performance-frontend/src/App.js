import React, { useState } from "react";
import "./styles.css";

const FASTAPI_URL = "http://127.0.0.1:8000/predict"; // change this to your backend

export default function StudentPredictor() {
  const [form, setForm] = useState({
    attendance: "85",
    internal: "18",
    assignment: "17",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const clamp = (name, val) => {
    let v = String(val).replace(/[^0-9.]/g, "");
    if (name === "attendance")
      v = Math.max(0, Math.min(100, Number(v || 0))).toString();
    else v = Math.max(0, Math.min(25, Number(v || 0))).toString();
    return v;
  };

  const onChange = (e) =>
    setForm((s) => ({
      ...s,
      [e.target.name]: clamp(e.target.name, e.target.value),
    }));

  const presets = {
    good: { attendance: 95, internal: 22, assignment: 22 },
    avg: { attendance: 75, internal: 15, assignment: 14 },
    risk: { attendance: 48, internal: 8, assignment: 6 },
  };

  const predict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        attendance: Number(form.attendance),
        internal: Number(form.internal),
        assignment: Number(form.assignment),
      };

      const res = await fetch(FASTAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("API error: " + res.status);

      const data = await res.json();
      const rec = { id: Date.now(), input: payload, output: data };

      setResult(rec);
      setHistory((h) => [rec, ...h].slice(0, 6));
    } catch (err) {
      console.error(err);
      setError("Could not reach backend. Check URL or CORS.");
    } finally {
      setLoading(false);
    }
  };

  const gauge = (score) => {
    const pct = Math.max(0, Math.min(100, Math.round(score || 0)));
    const dash = 126;
    const offset = dash - (pct / 100) * dash;

    return (
      <svg viewBox="0 0 100 60" className="gauge">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <path
          d="M10 50 A40 40 0 0 1 90 50"
          stroke="#f1f5f9"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M10 50 A40 40 0 0 1 90 50"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={offset}
        />

        <g transform={`rotate(${(-90 + (pct / 100) * 180)} 50 50)`}>
          <rect x="49" y="18" width="2" height="18" rx="1" fill="#0f172a" />
        </g>

        <text
          x="50"
          y="55"
          fontSize="10"
          textAnchor="middle"
          fill="#0f172a"
        >
          {pct}%
        </text>
      </svg>
    );
  };

  return (
    <div className="app">
      <div className="wrapper">
        {/* LEFT COLUMN */}
        <div className="leftCol">
          <div className="card">
            <div className="headerRow">
              <div>
                <div className="title">Student Performance Predictor</div>
              </div>
            </div>

            <form onSubmit={predict}>
              <div className="formRow">
                <div className="field">
                  <label>Attendance (%)</label>
                  <input
                    name="attendance"
                    value={form.attendance}
                    onChange={onChange}
                  />
                </div>

                <div className="field">
                  <label>Internal (25)</label>
                  <input
                    name="internal"
                    value={form.internal}
                    onChange={onChange}
                  />
                </div>

                <div className="field">
                  <label>Assignment (25)</label>
                  <input
                    name="assignment"
                    value={form.assignment}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="actions">
                <button className="btnPrimary" disabled={loading}>
                  {loading ? "Predicting..." : "Predict"}
                </button>

                <div className="presetRow">
                  <button
                    type="button"
                    className="preset"
                    onClick={() => setForm(presets.good)}
                  >
                    Good
                  </button>
                  <button
                    type="button"
                    className="preset"
                    onClick={() => setForm(presets.avg)}
                  >
                    Average
                  </button>
                  <button
                    type="button"
                    className="preset"
                    onClick={() => setForm(presets.risk)}
                  >
                    At Risk
                  </button>
                </div>
              </div>

              {error && <div className="error">{error}</div>}
            </form>

            <div className="small tip">
              Tip: Attendance 0–100. Internals & assignments out of 25.
            </div>

            {/* PREVIEW + PREDICTION */}
            <div className="twoGrid">
              <div className="card innerCard">
                <div className="small">Live Preview</div>
                <div className="previewRow">
                  <div className="textInfo">
                    <div className="small bold">Inputs</div>
                    <div className="small">
                      Attendance: {form.attendance}%
                    </div>
                    <div className="small">
                      Internal: {form.internal}/25
                    </div>
                    <div className="small">
                      Assignment: {form.assignment}/25
                    </div>
                  </div>
                  <div>
                    {gauge(
                      result
                        ? result.output.predicted_score
                        : (Number(form.attendance) * 0.5 +
                            Number(form.internal) * 1.2 +
                            Number(form.assignment) * 1.2) /
                            2
                    )}
                  </div>
                </div>
              </div>

              <div className="card innerCard">
                <div className="small">Prediction</div>
                {result ? (
                  <>
                    <div className="predictionBig">
                      {Math.round(result.output.predicted_score)}
                    </div>
                    <div className="badgeWrap">
                      <span
                        className={
                          "badge " +
                          (result.output.risk_level === "High"
                            ? "red"
                            : result.output.risk_level === "Medium"
                            ? "yellow"
                            : "green")
                        }
                      >
                        {result.output.risk_level}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="small">No prediction yet</div>
                )}
              </div>
            </div>

            {/* HISTORY */}
            <div className="history">
              <div className="small bold">Recent Predictions</div>
              {history.length === 0 && <div className="small">None yet</div>}

              {history.map((h) => (
                <div key={h.id} className="histRow">
                  <div>
                    <div className="bold">{Math.round(h.output.predicted_score)}</div>
                    <div className="small">
                      A:{h.input.attendance}% | I:{h.input.internal} | Ass:
                      {h.input.assignment}
                    </div>
                  </div>
                  <div className="small time">
                    {new Date(h.id).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        
      </div>
    </div>
  );
}
