import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { ContextPage } from '../../features/context/pages/ContextPage'
import { FiscalEntityContextPage } from '../../features/tenant/fiscal-entities/pages/FiscalEntityContextPage'
import { FiscalEntitiesPage } from '../../features/tenant/fiscal-entities/pages/FiscalEntitiesPage'
import { BranchContextPage } from '../../features/tenant/restaurants/pages/BranchContextPage'
import { RestaurantContextPage } from '../../features/tenant/restaurants/pages/RestaurantContextPage'
import { RestaurantsPage } from '../../features/tenant/restaurants/pages/RestaurantsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contexto" element={<ContextPage />} />
      <Route path="/tenant/restaurantes" element={<RestaurantsPage />} />
      <Route path="/tenant/entidades-fiscales" element={<FiscalEntitiesPage />} />
      <Route path="/tenant/entidades-fiscales/:id" element={<FiscalEntityContextPage />} />
      <Route path="/tenant/restaurantes/:id/sucursales/:branchId" element={<BranchContextPage />} />
      <Route path="/tenant/restaurantes/:id" element={<RestaurantContextPage />} />
    </Routes>
  )
}
