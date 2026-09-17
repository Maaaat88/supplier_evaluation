export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      <p className="font-medium text-slate-700">{title}</p>
      <p className="text-sm">Cette page sera disponible dans une prochaine étape.</p>
    </div>
  );
}
