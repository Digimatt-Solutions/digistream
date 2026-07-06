import logoAsset from "@/assets/logo.asset.json";

export function Brand({ className = "", showText = true, size = "md" }: { className?: string; showText?: boolean; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoAsset.url} alt="Digistream" className={`${h} w-auto`} />
      {showText && <span className="sr-only">Digistream</span>}
    </div>
  );
}
