import React, { useMemo, useState } from "react";

type Role = "user" | "assistant";

type ChatMsg = {
  role: Role;
  content: string;
};

type ApiOk = { success: true; data: { reply: string } };
type ApiErr = { success: false; error: string; retry_after?: string | null; retry_after_seconds?: number };
type ApiResp = ApiOk | ApiErr;

type Structured = {
  version: 1;
  intent: "worth_it" | "listing" | "shipping" | "sourcing" | "general";
  cards: { id: string; title: string; rows: { id: string; label: string; value: string }[] }[];
  missing: string[];
  next_question: string;
  sources: { name: string; type: "api" | "manual" | "none"; summary: string }[];
};

function tryParseStructured(s: string): Structured | null {
  const t = (s || "").trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  try {
    const obj = JSON.parse(t);
    if (!obj || typeof obj !== "object") return null;
    if (obj.version !== 1) return null;
    if (!Array.isArray(obj.cards)) return null;
    return obj as Structured;
  } catch {
    return null;
  }
}

export default function ChatWidget() {
  const endpoint = useMemo(() => {
    // If your API is on a different domain, hardcode it here:
    // return "https://thriftbot.app/api/chat";
    return "/api/chat";
  }, []);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [inFlight, setInFlight] = useState(false);
  const [history, setHistory] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m the EastersAI Reselling Robot. Ask: “I found a Nintendo Switch for $100 in 15210 — should I buy it?”",
    },
  ]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || inFlight) return;

    setText("");
    setInFlight(true);

    setHistory((h) => [...h, { role: "user", content: msg }, { role: "assistant", content: "…" }]);

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: history.slice(-4),
          live: true,
        }),
      });

      const data = (await r.json().catch(() => ({ success: false, error: "Non-JSON response" }))) as ApiResp;

      setHistory((h) => {
        const withoutTyping = h.slice(0, -1);
        if (!r.ok) {
          return [...withoutTyping, { role: "assistant", content: `Server error (${r.status}).` }];
        }
        if (!data.success) {
          const ra = (data.retry_after_seconds ?? null) ? ` Retry after ~${data.retry_after_seconds}s.` : "";
          return [...withoutTyping, { role: "assistant", content: `Error: ${data.error}.${ra}` }];
        }
        return [...withoutTyping, { role: "assistant", content: data.data.reply }];
      });
    } catch {
      setHistory((h) => [...h.slice(0, -1), { role: "assistant", content: "Server error. Try again in a moment." }]);
    } finally {
      setInFlight(false);
    }
  }

  return (
    <div className="ea-chat" id="ea-chat" aria-live="polite">
      <button className="ea-fab" aria-label="Open chat" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M50 22c4 0 8 3 8 8 0 9-7 16-16 16h-3l-3 6h-4l1-6h-9c-3 0-6-2-7-5l-5-15 7-2 3 10h6c2-4 6-8 10-10 3-1 6-2 12-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div
        className="ea-panel"
        style={{ display: open ? "block" : "none" }}
        role="dialog"
        aria-label="EastersAI Robot"
      >
        <div className="ea-header">
          <span className="ea-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M18 8c2 0 3 1 3 3 0 4-3 7-7 7h-1l-1 3h-2l0-3H7c-2 0-3-1-4-3l-2-6 3-1 2 5h3c1-2 3-4 5-5 2-.5 3-1 4-1z"
                fill="#111827"
              />
            </svg>
          </span>
          EastersAI Robot
        </div>

        <div className="ea-body">
          {history.map((m, idx) => {
            const isUser = m.role === "user";
            const structured = !isUser ? tryParseStructured(m.content) : null;

            if (structured) {
              return (
                <div key={idx} className="ea-msg ea-bot">
                  <div className="ea-bubble">
                    {structured.cards.map((c) => (
                      <div key={c.id} style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>{c.title}</div>
                        {c.rows.map((r) => (
                          <div key={r.id} style={{ marginBottom: 4 }}>
                            <strong>{r.label}:</strong> {r.value}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div style={{ marginTop: 8, opacity: 0.9 }}>
                      <strong>Next question:</strong> {structured.next_question}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className={`ea-msg ${isUser ? "ea-user" : "ea-bot"}`}>
                <div className="ea-bubble">{m.content}</div>
              </div>
            );
          })}

          <div className="ea-hint">Tip: include condition, ZIP code, and model for pricing checks.</div>
        </div>

        <form className="ea-input" onSubmit={sendMessage}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your question…"
            autoComplete="off"
            aria-label="Message to EastersAI"
          />
          <button type="submit" aria-label="Send message" disabled={inFlight}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
