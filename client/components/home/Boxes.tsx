import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/state/site-config";

interface BoxProps {
  title: string;
  color: string;
  heightPx: number;
  imageUrl?: string;
}

function Box({ title, color, heightPx, imageUrl }: BoxProps) {
  const { state } = useSiteConfig();
  const box = state.boxes.find((b) => b.title === title);
  const modalEnabled = box?.modalEnabled !== false;
  const modalStyle = box?.modalStyle || {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "group relative w-full rounded-xl border bg-white shadow-sm transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:cursor-not-allowed",
            "overflow-hidden",
            color,
          )}
          style={{ background: state.theme.boxDefaultBg || undefined }}
          disabled={!modalEnabled}
        >
          {/* Accent bar using per-card background selection */}
          <div className={cn("h-1 w-full", box?.background?.value)} />
          {/* Image on top with controlled height */}
          {imageUrl && (
            <div className="w-full">
              <img
                src={imageUrl}
                alt={title}
                className="w-full object-cover"
                style={{ height: heightPx }}
              />
            </div>
          )}
          {/* Card body */}
          <div className="p-4">
            <div className="text-base font-semibold text-neutral-900">
              {title}
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-brand-600 text-white shadow group-hover:bg-brand-500 transition-colors">
                {box?.buttonLabel || "Read More"}
              </span>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        className="md:max-w-2xl lg:max-w-3xl"
        style={{
          background: modalStyle.bg || undefined,
          color: modalStyle.text || undefined,
          boxShadow: modalStyle.shadow || undefined,
          borderRadius: modalStyle.radius ? `${modalStyle.radius}px` : undefined,
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 object-cover rounded"
            />
          )}
          {box?.description && (
            <div
              className="text-sm leading-6"
              dangerouslySetInnerHTML={{ __html: box.description }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Boxes() {
  const { state } = useSiteConfig();
  const visible = state.boxes.filter((b) => !b.hidden);
  const row1 = visible.filter((b) => b.size === "small");
  const rowLarge = visible.find((b) => b.size === "large");
  const rowMedium = visible.filter((b) => b.size === "medium");
  const pad = state.settings?.sectionPadding?.boxes ?? 24;

  return (
    <section
      className="mx-auto max-w-[1200px] px-6 mt-10 space-y-6"
      style={{
        paddingTop: pad,
        paddingBottom: pad,
        background: state.theme.boxesSectionBg,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {row1.map((b) => (
          <Box
            key={b.id}
            title={b.title}
            color={b.background?.value || "bg-neutral-100"}
            heightPx={b.height || state.settings?.boxHeights?.small || 200}
            imageUrl={b.imageUrl}
          />
        ))}
      </div>
      {rowLarge && (
        <div>
          <Box
            title={rowLarge.title}
            color={rowLarge.background?.value || "bg-neutral-100"}
            heightPx={
              rowLarge.height || state.settings?.boxHeights?.large || 280
            }
            imageUrl={rowLarge.imageUrl}
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rowMedium.map((b) => (
          <Box
            key={b.id}
            title={b.title}
            color={b.background?.value || "bg-neutral-100"}
            heightPx={b.height || state.settings?.boxHeights?.medium || 200}
            imageUrl={b.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
