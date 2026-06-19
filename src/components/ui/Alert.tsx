export function Alert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    variant === "error"
      ? "bg-danger/10 border-danger/30 text-danger"
      : "bg-success/10 border-success/30 text-success";

  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</p>
  );
}
