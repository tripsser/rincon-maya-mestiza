import {
  Activity,
  Banknote,
  Building2,
  ChefHat,
  ClipboardList,
  CreditCard,
  FileText,
  MapPin,
  Monitor,
  Printer,
  Settings,
  ShieldCheck,
  Store,
  Table2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResourceRail } from '../../../../shared/ui/ResourceRail'

export function BranchResourceRail({
  branchId,
  branchName,
  branches,
  restaurantId,
}: {
  branchId: string
  branchName: string
  branches: Array<{ activo: boolean; codigo: string; id: string; nombre: string }>
  restaurantId: string
}) {
  return (
    <ResourceRail
      accent="violet"
      footer={
        <>
          <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34">
            Cambiar de nivel
          </p>
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white"
            to={`/tenant/restaurantes/${restaurantId}`}
          >
            <Store size={16} className="text-norix-green" />
            Restaurante
          </Link>
          <Link
            className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white"
            to="/contexto"
          >
            <Building2 size={16} className="text-norix-blue" />
            Grupo Gourmet
          </Link>
        </>
      }
      icon={<MapPin size={18} />}
      items={[
        { icon: <FileText size={17} />, label: 'Informacion general' },
        { icon: <Table2 size={17} />, label: 'Mesas' },
        { icon: <ClipboardList size={17} />, label: 'Comandas' },
        { icon: <ChefHat size={17} />, label: 'Cocina' },
        { icon: <Banknote size={17} />, label: 'Caja' },
        { icon: <CreditCard size={17} />, label: 'Pagos' },
        { icon: <Users size={17} />, label: 'Empleados' },
        { icon: <Printer size={17} />, label: 'Impresoras' },
        { icon: <Monitor size={17} />, label: 'Activos' },
        { icon: <ShieldCheck size={17} />, label: 'Roles operativos' },
        { icon: <Activity size={17} />, label: 'Actividad' },
        { icon: <Settings size={17} />, label: 'Configuracion' },
      ]}
      resourceKind="Unidad operativa / Sucursal"
      storageKey="norix.branchRailPinned"
      switcherLabel="Cambiar unidad operativa"
      switcherItems={branches.map((branch) => ({
        active: branch.id === branchId,
        detail: `${branch.codigo} - ${branch.activo ? 'Activa' : 'Inactiva'}`,
        label: branch.nombre,
        to: `/tenant/restaurantes/${restaurantId}/sucursales/${branch.id}`,
      }))}
      title={branchName}
    />
  )
}
