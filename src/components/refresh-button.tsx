import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RefreshButton({ label = "Refresh" }: { label?: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    try {
      qc.clear();
      await router.invalidate();
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      toast.success("Cache cleared - reloading");
      setTimeout(() => window.location.reload(), 400);
    } catch {
      setBusy(false);
      toast.error("Refresh failed");
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={busy} className="rounded-full">
      <RefreshCw className={` h-2 w-2 ${busy ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
}
