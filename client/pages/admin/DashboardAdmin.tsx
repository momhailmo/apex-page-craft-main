import { useSiteConfig } from "@/state/site-config";

export default function DashboardAdmin() {
  const { state } = useSiteConfig();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-neutral-600">Slides</div>
          <div className="text-2xl font-bold">{state.slides.length}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-neutral-600">Boxes</div>
          <div className="text-2xl font-bold">{state.boxes.length}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-neutral-600">Logos</div>
          <div className="text-2xl font-bold">{state.logos.length}</div>
        </div>
      </div>
      <p className="text-sm text-neutral-600">
        Use the sidebar to manage each section. Changes are saved to your
        browser and applied instantly to the live preview.
      </p>
    </div>
  );
}
