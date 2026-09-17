import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.js';
import { ProtectedRoute } from './components/layout/ProtectedRoute.js';
import { ComingSoon } from './components/ui/ComingSoon.js';
import { EvaluationFormPage } from './pages/EvaluationFormPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { SupplierDetailPage } from './pages/SupplierDetailPage.js';
import { SuppliersPage } from './pages/SuppliersPage.js';
import { ValidationsPage } from './pages/ValidationsPage.js';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<ComingSoon title="Tableau de bord" />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="suppliers/:id/evaluate" element={<EvaluationFormPage />} />

          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="validations" element={<ValidationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
