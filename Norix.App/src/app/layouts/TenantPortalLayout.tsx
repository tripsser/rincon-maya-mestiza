import { Outlet } from 'react-router-dom'
import { MobileBottomNav } from '../../shared/ui/MobileBottomNav'
import { PortalTopBar } from '../../shared/ui/PortalTopBar'
import { TenantSidebar } from '../../shared/ui/TenantSidebar'

export function TenantPortalLayout() {
  return (
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex h-screen overflow-hidden">
        <TenantSidebar />
        <MobileBottomNav />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalTopBar />
          <Outlet />
        </section>
      </div>
    </main>
  )
}
