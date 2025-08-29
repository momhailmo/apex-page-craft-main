import { useSiteConfig } from "@/state/site-config";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function HeaderAdmin() {
  const { state, set } = useSiteConfig();
  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await readFileAsDataURL(f);
    set({ header: { ...state.header, logoUrl: url } });
  };
  const addLang = () =>
    set({
      header: {
        ...state.header,
        languages: [...(state.header.languages || []), { code: "", label: "" }],
      },
    });
  const updateLang = (
    i: number,
    patch: Partial<{ code: string; label: string }>,
  ) =>
    set({
      header: {
        ...state.header,
        languages: state.header.languages.map((l, idx) =>
          idx === i ? { ...l, ...patch } : l,
        ),
      },
    });
  const removeLang = (i: number) =>
    set({
      header: {
        ...state.header,
        languages: state.header.languages.filter((_, idx) => idx !== i),
      },
    });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Header</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          value={state.header.logoText}
          onChange={(e) =>
            set({ header: { ...state.header, logoText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Logo text"
        />
        <input
          value={state.header.languageText}
          onChange={(e) =>
            set({ header: { ...state.header, languageText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Language label"
        />
        <input
          value={state.header.contactText}
          onChange={(e) =>
            set({ header: { ...state.header, contactText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Contact text"
        />
      </div>
      <div className="flex items-center gap-3">
        {state.header.logoUrl && (
          <img
            src={state.header.logoUrl}
            alt="logo"
            className="h-10 w-10 object-contain"
          />
        )}
        <label className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white cursor-pointer">
          Upload Logo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadLogo}
          />
        </label>
      </div>
      <div>
        <div className="mb-2 font-medium">Languages</div>
        <div className="space-y-2">
          {state.header.languages?.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={l.code}
                onChange={(e) => updateLang(i, { code: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-24"
                placeholder="code"
              />
              <input
                value={l.label}
                onChange={(e) => updateLang(i, { label: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
                placeholder="label"
              />
              <button
                onClick={() =>
                  set({ header: { ...state.header, selectedLang: l.code } })
                }
                className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
              >
                Set Default
              </button>
              <button
                onClick={() => removeLang(i)}
                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addLang}
          className="mt-2 text-sm px-3 py-2 rounded-md bg-neutral-800 text-white"
        >
          Add Language
        </button>
      </div>
    </div>
  );
}

export function FooterAdmin() {
  const { state, set } = useSiteConfig();
  const updateSocial = (k: string, v: string) =>
    set({
      footer: {
        ...state.footer,
        socials: { ...(state.footer.socials || {}), [k]: v },
        text: state.footer.text,
        extraText: state.footer.extraText,
      },
    });
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Footer</h2>
      <label className="block text-sm">Copyright</label>
      <textarea
        value={state.footer.text}
        onChange={(e) =>
          set({ footer: { ...state.footer, text: e.target.value } })
        }
        className="w-full border rounded px-2 py-2"
      />
      <label className="block text-sm">Extra Text</label>
      <input
        value={state.footer.extraText || ""}
        onChange={(e) =>
          set({ footer: { ...state.footer, extraText: e.target.value } })
        }
        className="w-full border rounded px-2 py-1"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {(
          [
            "facebook",
            "twitter",
            "instagram",
            "linkedin",
            "github",
            "youtube",
          ] as const
        ).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <label className="w-24 text-sm capitalize">{k}</label>
            <input
              value={(state.footer.socials || {})[k] || ""}
              onChange={(e) => updateSocial(k, e.target.value)}
              placeholder={`https://${k}.com/...`}
              className="flex-1 border rounded px-2 py-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ColorsAdmin() {
  const { state, set } = useSiteConfig();
  const updateTheme = (patch: any) =>
    set({ theme: { ...state.theme, ...patch } });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Colors</h2>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Brand</label>
        <input
          type="color"
          value={state.theme.brand}
          onChange={(e) => updateTheme({ brand: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Global Page Background</label>
        <input
          type="text"
          value={state.theme.pageBg || ""}
          onChange={(e) => updateTheme({ pageBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
          placeholder="#ffffff or linear-gradient(...)"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Boxes Section Background</label>
        <input
          type="text"
          value={state.theme.boxesSectionBg || ""}
          onChange={(e) => updateTheme({ boxesSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
          placeholder="color or gradient"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Logos Section Background</label>
        <input
          type="text"
          value={state.theme.logosSectionBg || ""}
          onChange={(e) => updateTheme({ logosSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Contact Section Background</label>
        <input
          type="text"
          value={state.theme.contactSectionBg || ""}
          onChange={(e) => updateTheme({ contactSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Default Box Background</label>
        <input
          type="text"
          value={state.theme.boxDefaultBg || ""}
          onChange={(e) => updateTheme({ boxDefaultBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <p className="text-sm text-neutral-600">
        Supports hex colors or CSS gradients (e.g., linear-gradient(...)). All
        updates apply live.
      </p>
    </div>
  );
}

export function SettingsAdmin() {
  const { state, set } = useSiteConfig();
  const s = state.settings || {};
  const update = (patch: any) => set({ settings: { ...s, ...patch } });
  const setPad =
    (k: keyof NonNullable<typeof s.sectionPadding>) => (v: number) =>
      update({ sectionPadding: { ...(s.sectionPadding || {}), [k]: v } });
  const setBox = (k: keyof NonNullable<typeof s.boxHeights>) => (v: number) =>
    update({
      boxHeights: {
        ...(s.boxHeights || { small: 200, medium: 200, large: 280 }),
        [k]: v,
      },
    });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="space-y-2">
        <div className="font-medium">Section Padding (px)</div>
        {(["hero", "boxes", "logos", "contact"] as const).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <label className="w-24 text-sm capitalize">{k}</label>
            <input
              type="range"
              min={0}
              max={96}
              value={(s.sectionPadding || {})[k] || 24}
              onChange={(e) => setPad(k)(Number(e.target.value))}
            />
            <input
              type="number"
              className="w-20 border rounded px-2 py-1 text-sm"
              value={(s.sectionPadding || {})[k] || 24}
              onChange={(e) => setPad(k)(Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="font-medium">Default Box Heights (px)</div>
        {(["small", "medium", "large"] as const).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <label className="w-24 text-sm capitalize">{k}</label>
            <input
              type="range"
              min={120}
              max={600}
              value={
                (s.boxHeights || { small: 200, medium: 200, large: 280 })[k]
              }
              onChange={(e) => setBox(k)(Number(e.target.value))}
            />
            <input
              type="number"
              className="w-20 border rounded px-2 py-1 text-sm"
              value={
                (s.boxHeights || { small: 200, medium: 200, large: 280 })[k]
              }
              onChange={(e) => setBox(k)(Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm">Contact recipient email</label>
        <input
          value={s.contactEmail || ""}
          onChange={(e) => update({ contactEmail: e.target.value })}
          className="border rounded px-2 py-1"
          placeholder="you@company.com"
        />
      </div>
      <p className="text-sm text-neutral-600">
        Local Storage is used in this demo. Connect a database later for
        persistence.
      </p>
    </div>
  );
}
