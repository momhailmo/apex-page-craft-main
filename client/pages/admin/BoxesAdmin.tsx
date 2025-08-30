import { useSiteConfig } from "@/state/site-config";
import { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

function expandShortHex(hex?: string): string | undefined {
  if (!hex) return hex;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [html, setHtml] = useState<string>(value || "");
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => setHtml(value || ""), [value]);
  const focusEditor = () => ref.current && ref.current.focus();
  const exec = (cmd: string, arg?: string) => {
    focusEditor();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML || "");
  };
  const insertEmoji = (emoji: string) => {
    focusEditor();
    document.execCommand("insertText", false, emoji);
    onChange(ref.current?.innerHTML || "");
  };
  return (
    <div className="border rounded">
      <div className="flex flex-wrap gap-1 p-2 border-b text-xs">
        <button onClick={() => exec("bold")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">B</button>
        <button onClick={() => exec("italic")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">I</button>
        <button onClick={() => exec("underline")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">U</button>
        <button onClick={() => exec("insertUnorderedList")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">• List</button>
        <button onClick={() => exec("formatBlock", "H3")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">H3</button>
        <button onClick={() => exec("formatBlock", "P")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">P</button>
        <button onClick={() => insertEmoji("😊")} className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">😊</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[100px] p-3 text-sm whitespace-pre-wrap break-words"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function BoxesAdmin() {
  const { state, set } = useSiteConfig();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [drafts, setDrafts] = useState(() => state.boxes.map((b) => ({ ...b })));

  useEffect(() => {
    setDrafts(state.boxes.map((b) => ({ ...b })));
  }, [state.boxes.length]);

  const setDraft = (id: string, patch: any) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const add = () => {
    const nb = {
      id: crypto.randomUUID(),
      title: "New Box",
      type: "image" as const,
      size: "small" as const,
      height: 200,
      background: { kind: "color", color: "#f3f4f6" } as any,
      buttonLabel: "Read More",
      ctaMode: "button" as const,
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" as const },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    };
    set({ boxes: [...state.boxes, nb] });
  };

  const remove = (id: string) => set({ boxes: state.boxes.filter((b) => b.id !== id) });
  const toggle = (id: string) => set({ boxes: state.boxes.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)) });

  const apply = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    set({ boxes: state.boxes.map((b) => (b.id === id ? draft : b)) });
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    const arr = [...state.boxes];
    const [it] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, it);
    set({ boxes: arr });
    setDragIdx(null);
  };

  const items = useMemo(() => state.boxes.map((b) => ({ live: b, draft: drafts.find((d) => d.id === b.id) || b })), [state.boxes, drafts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Boxes Management</h2>
        <button onClick={add} className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white">Add Box</button>
      </div>
      <div className="space-y-3">
        {items.map(({ live, draft }, i) => (
          <div key={live.id} className="bg-white p-4 rounded-md border" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)}>
            <div className="flex items-center gap-3">
              <span
                title="Drag to reorder"
                className="cursor-grab inline-flex items-center justify-center h-8 w-8 rounded bg-neutral-100"
                draggable
                onDragStart={() => onDragStart(i)}
              >
                <GripVertical className="h-4 w-4 text-neutral-600" />
              </span>
              <input
                value={draft.title}
                onChange={(e) => setDraft(live.id, { title: e.target.value })}
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <select
                value={draft.size as any}
                onChange={(e) => setDraft(live.id, { size: e.target.value as any })}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <input
                type="number"
                min={120}
                max={600}
                value={draft.height || 200}
                onChange={(e) => setDraft(live.id, { height: Number(e.target.value) })}
                className="w-24 border rounded px-2 py-1 text-sm"
              />
              <button onClick={() => toggle(live.id)} className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200">{live.hidden ? "Show" : "Hide"}</button>
              <button onClick={() => remove(live.id)} className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200">Delete</button>
            </div>

            <div className="mt-3 grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {draft.imageUrl && <img src={draft.imageUrl} alt="preview" className="h-14 w-24 object-cover rounded" />}
                  <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await new Promise<string>((res, rej) => {
                        const r = new FileReader();
                        r.onload = () => res(r.result as string);
                        r.onerror = rej;
                        r.readAsDataURL(f);
                      });
                      setDraft(live.id, { imageUrl: url, type: "image" });
                    }} />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">CTA Mode</label>
                  <select value={draft.ctaMode || "button"} onChange={(e) => setDraft(live.id, { ctaMode: e.target.value as any })} className="border rounded px-2 py-1 text-sm">
                    <option value="button">Button only</option>
                    <option value="icon">Icon only</option>
                    <option value="both">Button + Icon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Button Label</label>
                  <input value={draft.buttonLabel || "Read More"} onChange={(e) => setDraft(live.id, { buttonLabel: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={draft.modalEnabled !== false} onChange={(e) => setDraft(live.id, { modalEnabled: e.target.checked })} /> Enable Modal
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Border Radius</label>
                  <input type="range" min={0} max={28} value={draft.borderRadius ?? 12} onChange={(e) => setDraft(live.id, { borderRadius: Number(e.target.value) })} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Shadow</label>
                  <div className="flex items-center gap-2">
                    <select value={draft.shadow?.direction || "bottom-right"} onChange={(e) => setDraft(live.id, { shadow: { ...(draft.shadow || { intensity: 12 }), direction: e.target.value as any } })} className="border rounded px-2 py-1 text-sm">
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                    <input type="range" min={0} max={30} value={draft.shadow?.intensity ?? 12} onChange={(e) => setDraft(live.id, { shadow: { ...(draft.shadow || { direction: "bottom-right" }), intensity: Number(e.target.value) } })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Background</label>
                  <div className="flex flex-wrap gap-2">
                    <select value={draft.background?.kind || "color"} onChange={(e) => setDraft(live.id, { background: e.target.value === "color" ? { kind: "color", color: "#f3f4f6" } : e.target.value === "gradient" ? { kind: "gradient", from: "#ffffff", to: "#f3f4f6", direction: "to bottom" } : { kind: "image", url: draft.background && (draft.background as any).url || "", scale: 100, opacity: 1, overlay: "none", overlayStrength: 0.4 } as any })} className="border rounded px-2 py-1 text-sm">
                      <option value="color">Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                    {draft.background?.kind === "color" && (
                      <input type="color" value={(draft.background as any).color || "#f3f4f6"} onChange={(e) => setDraft(live.id, { background: { kind: "color", color: expandShortHex(e.target.value) || e.target.value } as any })} />
                    )}
                    {draft.background?.kind === "gradient" && (
                      <div className="flex items-center gap-2">
                        <input type="color" value={(draft.background as any).from || "#ffffff"} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), from: expandShortHex(e.target.value) || e.target.value } as any })} />
                        <input type="color" value={(draft.background as any).to || "#f3f4f6"} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), to: expandShortHex(e.target.value) || e.target.value } as any })} />
                        <select value={(draft.background as any).direction || "to bottom"} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), direction: e.target.value } as any })} className="border rounded px-2 py-1 text-sm">
                          <option value="to top">to top</option>
                          <option value="to bottom">to bottom</option>
                          <option value="to left">to left</option>
                          <option value="to right">to right</option>
                          <option value="to top right">to top right</option>
                          <option value="to top left">to top left</option>
                          <option value="to bottom right">to bottom right</option>
                          <option value="to bottom left">to bottom left</option>
                        </select>
                      </div>
                    )}
                    {draft.background?.kind === "image" && (
                      <div className="space-y-2 w-full">
                        {(draft.background as any).url && <img src={(draft.background as any).url} alt="bg" className="h-14 w-24 object-cover rounded" />}
                        <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer inline-block">
                          Upload Background
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await new Promise<string>((res, rej) => {
                              const r = new FileReader();
                              r.onload = () => res(r.result as string);
                              r.onerror = rej;
                              r.readAsDataURL(f);
                            });
                            const bg = draft.background as any;
                            setDraft(live.id, { background: { kind: "image", url, scale: bg?.scale || 100, opacity: bg?.opacity ?? 1, overlay: bg?.overlay || "none", overlayStrength: bg?.overlayStrength ?? 0.4 } as any });
                          }} />
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Scale</span>
                          <input type="range" min={50} max={200} value={(draft.background as any).scale || 100} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), scale: Number(e.target.value) } as any })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Opacity</span>
                          <input type="range" min={0} max={1} step={0.05} value={(draft.background as any).opacity ?? 1} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), opacity: Number(e.target.value) } as any })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Adjust</span>
                          <select value={(draft.background as any).overlay || "none"} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), overlay: e.target.value as any } as any })} className="border rounded px-2 py-1 text-sm">
                            <option value="none">None</option>
                            <option value="darken">Darken</option>
                            <option value="lighten">Lighten</option>
                          </select>
                          <input type="range" min={0} max={1} step={0.05} value={(draft.background as any).overlayStrength ?? 0.4} onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), overlayStrength: Number(e.target.value) } as any })} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm">Modal Styles</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">BG</span>
                    <input type="color" value={expandShortHex(draft.modalStyle?.bg) || "#111111"} onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, bg: expandShortHex(e.target.value) } })} />
                    <span className="text-xs">Text</span>
                    <input type="color" value={expandShortHex(draft.modalStyle?.text) || "#ffffff"} onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, text: expandShortHex(e.target.value) } })} />
                    <span className="text-xs">Radius</span>
                    <input type="range" min={0} max={28} value={draft.modalStyle?.radius || 16} onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, radius: Number(e.target.value) } })} />
                  </div>
                  <input value={draft.modalStyle?.shadow || "0 10px 30px rgba(0,0,0,0.3)"} onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, shadow: e.target.value } })} className="w-full border rounded px-2 py-1 text-xs" placeholder="CSS box-shadow" />
                </div>

                <label className="block text-sm">Description</label>
                <RichTextEditor value={draft.description || ""} onChange={(html) => setDraft(live.id, { description: html })} />

                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => apply(live.id)} className="text-sm px-3 py-2 rounded-md bg-brand-600 text-white">Apply</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-sm text-neutral-600 mt-3">Drag using the handle to reorder. Changes apply when you press Apply.</div>
    </div>
  );
}
