import { useEffect, useState } from "react";

interface Msg {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read?: boolean;
  at?: string;
}

export default function ContactAdmin() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<Msg | null>(null);

  const load = () => {
    try {
      setMsgs(JSON.parse(localStorage.getItem("contactMessages") || "[]"));
    } catch {
      setMsgs([]);
    }
  };
  useEffect(() => {
    load();
    const onAny = () => load();
    window.addEventListener("storage", onAny);
    window.addEventListener("contact-messages-change", onAny as any);
    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener("contact-messages-change", onAny as any);
    };
  }, []);

  const mark = (id: string, read: boolean) => {
    const arr = msgs.map((m) => (m.id === id ? { ...m, read } : m));
    setMsgs(arr);
    localStorage.setItem("contactMessages", JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("contact-messages-change"));
  };
  const remove = (id: string) => {
    const arr = msgs.filter((m) => m.id !== id);
    setMsgs(arr);
    localStorage.setItem("contactMessages", JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("contact-messages-change"));
  };
  const markAllRead = () => {
    const arr = msgs.map((m) => ({ ...m, read: true }));
    setMsgs(arr);
    localStorage.setItem("contactMessages", JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("contact-messages-change"));
  };

  const [recipient, setRecipient] = useState<string>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("site-config-v1") || "{}")?.settings
          ?.contactEmail || ""
      );
    } catch {
      return "";
    }
  });
  const saveRecipient = (v: string) => {
    setRecipient(v);
    try {
      const cfg = JSON.parse(localStorage.getItem("site-config-v1") || "{}");
      cfg.settings = { ...(cfg.settings || {}), contactEmail: v };
      localStorage.setItem("site-config-v1", JSON.stringify(cfg));
      window.dispatchEvent(
        new CustomEvent("site-config-change", { detail: cfg }),
      );
    } catch {}
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={markAllRead}
            className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
          >
            Mark all read
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm">Recipient email:</label>
          <input
            value={recipient}
            onChange={(e) => saveRecipient(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="you@company.com"
          />
        </div>
        <div className="bg-white rounded border divide-y">
          {msgs.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`w-full text-left p-3 ${!m.read ? "bg-neutral-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(m.at || Date.now()).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-neutral-700">{m.subject}</div>
              {!m.read && (
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-brand-600 text-white rounded">
                  NEW
                </span>
              )}
            </button>
          ))}
          {msgs.length === 0 && (
            <div className="p-4 text-sm text-neutral-600">No messages yet.</div>
          )}
        </div>
      </div>
      <div>
        {selected ? (
          <div className="bg-white rounded border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selected.subject}</h3>
              <div className="space-x-2">
                <button
                  onClick={() => mark(selected.id, true)}
                  className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
                >
                  Mark read
                </button>
                <button
                  onClick={() => remove(selected.id)}
                  className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-sm">
              From: <span className="font-medium">{selected.name}</span> •{" "}
              <a href={`mailto:${selected.email}`} className="underline">
                {selected.email}
              </a>
            </div>
            <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
          </div>
        ) : (
          <div className="text-sm text-neutral-600">
            Select a message to view details.
          </div>
        )}
      </div>
    </div>
  );
}
