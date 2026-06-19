export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
    </div>
  );
}
