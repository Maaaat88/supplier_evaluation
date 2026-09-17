import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold text-slate-900">Page introuvable</p>
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
