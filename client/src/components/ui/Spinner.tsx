export function Spinner() {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
