export function EnclosureNested({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`enclosure-nested ${className}`}>
      <div className="enclosure-nested__inner">{children}</div>
    </div>
  );
}
