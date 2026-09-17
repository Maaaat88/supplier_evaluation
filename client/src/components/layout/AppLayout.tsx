import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { ROLE_LABELS } from '../../lib/labels.js';

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
  }`;
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = (
    <>
      <NavLink to="/" className={navLinkClass} end onClick={() => setMobileMenuOpen(false)}>
        Tableau de bord
      </NavLink>
      <NavLink to="/suppliers" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
        Fournisseurs
      </NavLink>
      {user?.role === 'ADMIN' && (
        <NavLink
          to="/validations"
          className={navLinkClass}
          onClick={() => setMobileMenuOpen(false)}
        >
          Validations
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-slate-900">Évaluation fournisseurs</span>
            <nav className="hidden gap-1 md:flex">{links}</nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <span className="text-sm text-slate-600">
                {user.firstName} {user.lastName} · {ROLE_LABELS[user.role]}
              </span>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Déconnexion
            </button>
          </div>

          <button
            type="button"
            className="rounded p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-2 md:hidden">
            {links}
            <button
              type="button"
              onClick={() => logout()}
              className="mt-2 rounded border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700"
            >
              Déconnexion
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
