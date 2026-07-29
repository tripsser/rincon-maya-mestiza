import { Route, Routes } from 'react-router-dom'
import { BranchPortalLayout } from '../layouts/BranchPortalLayout'
import { RestaurantPortalLayout } from '../layouts/RestaurantPortalLayout'
import { TenantPortalLayout } from '../layouts/TenantPortalLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { ContextPage } from '../../features/context/pages/ContextPage'
import { LandingPage } from '../../features/marketing/pages/LandingPage'
import { FiscalEntityContextPage } from '../../features/tenant/fiscal-entities/pages/FiscalEntityContextPage'
import { FiscalEntitiesPage } from '../../features/tenant/fiscal-entities/pages/FiscalEntitiesPage'
import { BranchContextPage } from '../../features/tenant/restaurants/pages/BranchContextPage'
import { RestaurantContextPage } from '../../features/tenant/restaurants/pages/RestaurantContextPage'
import { RestaurantsPage } from '../../features/tenant/restaurants/pages/RestaurantsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<TenantPortalLayout />}>
        <Route path="/contexto" element={<ContextPage />} />
        <Route path="/tenant/restaurantes" element={<RestaurantsPage />} />
        <Route path="/tenant/entidades-fiscales" element={<FiscalEntitiesPage />} />
        <Route path="/tenant/entidades-fiscales/:id" element={<FiscalEntityContextPage />} />
        <Route path="/tenant/restaurantes/:id" element={<RestaurantPortalLayout />}>
          <Route index element={<RestaurantContextPage />} />
          <Route path="sucursales/:branchId" element={<BranchPortalLayout />}>
            <Route index element={<BranchContextPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
