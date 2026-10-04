"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useSession } from "@/lib/session";
import { SellerShell } from "@/components/SellerShell";
import {
  getSellerMessages,
  markMessageRead,
  sendSellerReply,
  type SellerMessageThread
} from "@/lib/seller";

export default function SellerMessagesPage() {
  return (
    <SellerShell title="Messages" subtitle="№ Inbox">
      <SellerMessagesInner />
    </SellerShell>
  );
}

function SellerMessagesInner() {
  const { session } = useSession();
  const [threads, setThreads] = useState<SellerMessageThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const shop = session.role === "seller" ? session.shopSlug : "";

  function reload(preserveSelection: boolean = true) {
    if (!shop) return;
    const list = getSellerMessages(shop);
    setThreads(list);
    if (!preserveSelection || (selectedId && !list.find((t) => t.id === selectedId))) {
      setSelectedId(list[0]?.id ?? null);
    } else if (!selectedId) {
      setSelectedId(list[0]?.id ?? null);
    }
  }

  useEffect(() => {
    reload(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  function onSelect(threadId: string) {
    setSelectedId(threadId);
    markMessageRead(shop, threadId);
    reload();
  }

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    sendSellerReply(shop, selected.id, reply);
    setReply("");
    reload();
  }

  if (!shop) return null;

  return (
    <div
      className="tn-card"
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        minHeight: 540,
        overflow: "hidden"
      }}
    >
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto" }}>
        {threads.length === 0 ? (
          <div className="tn-body-sm" style={{ padding: 24, textAlign: "center" }}>
            No messages yet.
          </div>
        ) : (
          threads.map((t) => {
            const active = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 18px",
                  borderTop: "1px solid var(--line-soft)",
                  background: active ? "var(--paper-soft)" : "transparent",
                  borderLeft: active ? "3px solid var(--terracotta)" : "3px solid transparent",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.customer_name}
                  </div>
                  {t.unread && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "var(--terracotta)",
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
                <div
                  className="tn-body-sm"
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {t.subject}
                </div>
                <div className="tn-label-mono" style={{ fontSize: 10, marginTop: 4, color: "var(--muted)" }}>
                  {timeAgo(t.last_at)}
                </div>
              </button>
            );
          })
        )}
      </aside>

      <section style={{ display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: 0 }}>
        {selected ? (
          <>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{selected.subject}</div>
              <div className="tn-body-sm" style={{ fontSize: 12, marginTop: 4 }}>
                from <strong>{selected.customer_name}</strong> · {selected.customer_email}
              </div>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.from === "seller" ? "flex-end" : "flex-start",
                    maxWidth: "76%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: m.from === "seller" ? "var(--terracotta)" : "var(--paper-soft)",
                    color: m.from === "seller" ? "var(--paper)" : "var(--ink)",
                    fontSize: 13,
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                  <div
                    className="tn-label-mono"
                    style={{
                      fontSize: 10,
                      marginTop: 6,
                      opacity: 0.7,
                      textAlign: m.from === "seller" ? "right" : "left"
                    }}
                  >
                    {m.from === "seller" ? "YOU" : "CUSTOMER"} · {timeAgo(m.at)}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={onSend}
              style={{
                display: "flex",
                gap: 8,
                padding: 16,
                borderTop: "1px solid var(--line)",
                background: "var(--paper-soft)"
              }}
            >
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply…"
                rows={2}
                className="tn-input"
                style={{ flex: 1, resize: "vertical", fontFamily: "inherit" }}
              />
              <button type="submit" className="tn-btn" disabled={!reply.trim()} style={{ alignSelf: "stretch" }}>
                <Send size={14} /> Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Select a thread to view messages.
          </div>
        )}
      </section>
    </div>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
