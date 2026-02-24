export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}
