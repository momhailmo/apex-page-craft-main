import { useSiteConfig } from "@/state/site-config";
import { useState } from "react";

function expandShortHex(hex?: string): string | undefined {
  if (!hex) return hex;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}

export default function BoxesAdmin() {
  const { state, set } = useSiteConfig();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const add = () =>
    set({
      boxes: [
        ...state.boxes,
        {
          id: crypto.randomUUID(),
          title: "New Box",
          type: "image",
          size: "small",
          height: 200,
          background: { kind: "color", value: "bg-neutral-100" },
          buttonLabel: "Read More",
          modalEnabled: true,
          modalStyle: {
            bg: "#111111",
            text: "#ffffff",
            shadow: "0 10px 30px rgba(0,0,0,0.3)",
            radius: 16,
          },
        },
      ],
    });
  const remove = (id: string) =>
    set({ boxes: state.boxes.filter((b) => b.id !== id) });
  const toggle = (id: string) =>
    set({
      boxes: state.boxes.map((b) =>
        b.id === id ? { ...b, hidden: !b.hidden } : b,
      ),
    });

  const update = (id: string, patch: any) =>
    set({
      boxes: state.boxes.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    const arr = [...state.boxes];
    const [it] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, it);
    set({ boxes: arr });
    setDragIdx(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Boxes Management</h2>
        <button
          onClick={add}
          className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white"
        >
          Add Box
        </button>
      </div>
      <div className="space-y-3">
        {state.boxes.map((b, i) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded-md border"
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <div className="flex items-center gap-3">
              <input
                value={b.title}
                onChange={(e) => update(b.id, { title: e.target.value })}
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <select
                value={b.size}
                onChange={(e) => update(b.id, { size: e.target.value as any })}
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
                value={b.height || 200}
                onChange={(e) =>
                  update(b.id, { height: Number(e.target.value) })
                }
                className="w-24 border rounded px-2 py-1 text-sm"
              />
              <select
                value={b.background?.value || "bg-neutral-100"}
                onChange={(e) =>
                  update(b.id, {
                    background: { kind: "color", value: e.target.value },
                  })
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="bg-neutral-100">Neutral</option>
                <option value="bg-cyan-50">Light Cyan</option>
                <option value="bg-emerald-50">Mint</option>
                <option value="bg-yellow-50">Light Yellow</option>
                <option value="bg-orange-50">Light Orange</option>
                <option value="bg-blue-50">Light Blue</option>
                <option value="bg-pink-50">Light Pink</option>
              </select>
              <button
                onClick={() => toggle(b.id)}
                className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
              >
                {b.hidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => remove(b.id)}
                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {b.imageUrl && (
                <img
                  src={b.imageUrl}
                  alt="preview"
                  className="h-14 w-24 object-cover rounded"
                />
              )}
              <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await new Promise<string>((res, rej) => {
                      const r = new FileReader();
                      r.onload = () => res(r.result as string);
                      r.onerror = rej;
                      r.readAsDataURL(f);
                    });
                    update(b.id, { imageUrl: url, type: "image" });
                  }}
                />
              </label>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm">Button Label</label>
                <input
                  value={b.buttonLabel || "Read More"}
                  onChange={(e) =>
                    update(b.id, { buttonLabel: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={b.modalEnabled !== false}
                    onChange={(e) =>
                      update(b.id, { modalEnabled: e.target.checked })
                    }
                  />{" "}
                  Enable Modal
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Modal Styles</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">BG</span>
                  <input
                    type="color"
                    value={expandShortHex(b.modalStyle?.bg) || "#111111"}
                    onChange={(e) =>
                      update(b.id, {
                        modalStyle: {
                          ...b.modalStyle,
                          bg: expandShortHex(e.target.value),
                        },
                      })
                    }
                  />
                  <span className="text-xs">Text</span>
                  <input
                    type="color"
                    value={expandShortHex(b.modalStyle?.text) || "#ffffff"}
                    onChange={(e) =>
                      update(b.id, {
                        modalStyle: {
                          ...b.modalStyle,
                          text: expandShortHex(e.target.value),
                        },
                      })
                    }
                  />
                  <span className="text-xs">Radius</span>
                  <input
                    type="range"
                    min={0}
                    max={28}
                    value={b.modalStyle?.radius || 16}
                    onChange={(e) =>
                      update(b.id, {
                        modalStyle: {
                          ...b.modalStyle,
                          radius: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <input
                  value={b.modalStyle?.shadow || "0 10px 30px rgba(0,0,0,0.3)"}
                  onChange={(e) =>
                    update(b.id, {
                      modalStyle: { ...b.modalStyle, shadow: e.target.value },
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="CSS box-shadow"
                />
              </div>
            </div>
            <label className="mt-3 block text-sm">
              Description (Rich text HTML allowed)
            </label>
            <textarea
              value={b.description || ""}
              onChange={(e) => update(b.id, { description: e.target.value })}
              placeholder="<p>Describe this box...</p>"
              className="w-full border rounded px-2 py-2 text-sm min-h-[90px]"
            ></textarea>
          </div>
        ))}
      </div>
      <div className="text-sm text-neutral-600 mt-3">
        Drag cards to reorder. Height in pixels. Background currently supports
        flat colors.
      </div>
    </div>
  );
}
