export function Brand({
  className = "",
  showText = true,
  size = "md",
  variant = "icon",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
}) {
  const h = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  const src = variant === "full" ? "/logo-full.png" : "/logo.png";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={src} alt="Digistream" className={`${h} w-auto`} />
      {showText && <span className="sr-only">Digistream</span>}
    </div>
  );
}
