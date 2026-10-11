import { useRef, useState } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { uploadToBucket } from "@/lib/upload";
import { toast } from "sonner";

type Props = {
  bucket: string;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  prefix?: string;
  className?: string;
};

export function ImageUploader({ bucket, value, onChange, label, prefix, className }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => ref.current?.click();

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadToBucket(bucket, f, prefix);
      onChange(url);
      toast.success(`${label || "Image"} uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </label>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={handle} className="hidden" />
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden rose-border aspect-video bg-secondary">
          <img src={value} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center gap-1"
            >
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="w-full aspect-video rounded-xl border border-dashed border-border/60 bg-background/30 hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {busy ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <ImagePlus className="w-6 h-6 text-primary" />
          )}
          <span className="text-xs">{busy ? "Uploading…" : "Click to upload"}</span>
        </button>
      )}
    </div>
  );
}
