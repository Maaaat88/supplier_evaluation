export function AccessDenied() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold text-slate-900">Accès refusé</p>
      <p className="text-sm text-slate-600">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
    </div>
  );
}
