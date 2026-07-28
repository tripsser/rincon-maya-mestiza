import { useQuery } from '@tanstack/react-query'
import { Building2, FileText, MapPin, Settings, ShieldCheck, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResourceRail } from '../../../../shared/ui/ResourceRail'
import { getRestaurants } from '../api/restaurantsApi'

export function RestaurantResourceRail({
  compactOnChild = false,
  restaurantId,
  restaurantName,
}: {
  compactOnChild?: boolean
  restaurantId: string
  restaurantName: string
}) {
  const restaurantsQuery = useQuery({
    queryKey: ['tenant-restaurants-switcher'],
    queryFn: () => getRestaurants({ activo: true }),
  })
  const restaurantSwitcherItems = buildRestaurantSwitcherItems({
    currentId: restaurantId,
    currentName: restaurantName,
    restaurants: restaurantsQuery.data ?? [],
  })

  return (
    <ResourceRail
      accent="green"
      forceCompact={compactOnChild}
      footer={
        <>
          <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34">
            Cambiar de nivel
          </p>
          <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white" to="/tenant/restaurantes">
            <Store size={16} className="text-norix-green" />
            Restaurantes
          </Link>
          <Link className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white" to="/contexto">
            <Building2 size={16} className="text-norix-blue" />
            Grupo Gourmet
          </Link>
        </>
      }
      icon={<Store size={18} />}
      items={[
        { icon: <FileText size={17} />, label: 'Informacion general', to: `/tenant/restaurantes/${restaurantId}` },
        { icon: <MapPin size={17} />, label: 'Sucursales' },
        { icon: <Users size={17} />, label: 'Usuarios' },
        { icon: <ShieldCheck size={17} />, label: 'Roles y permisos' },
        { icon: <Settings size={17} />, label: 'Configuracion' },
      ]}
      resourceKind="Restaurante / Marca"
      storageKey="norix.restaurantRailPinned"
      switcherItems={restaurantSwitcherItems}
      switcherLabel="Cambiar restaurante / marca"
      title={restaurantName}
    />
  )
}

function buildRestaurantSwitcherItems({
  currentId,
  currentName,
  restaurants,
}: {
  currentId: string
  currentName: string
  restaurants: Array<{ codigo: string; id: string; nombre: string }>
}) {
  const items = restaurants.map((restaurant) => ({
    active: restaurant.id === currentId,
    detail: restaurant.codigo,
    label: restaurant.nombre,
    to: `/tenant/restaurantes/${restaurant.id}`,
  }))

  if (items.some((item) => item.to.endsWith(currentId))) {
    return items
  }

  return [
    {
      active: true,
      detail: 'Actual',
      label: currentName,
      to: `/tenant/restaurantes/${currentId}`,
    },
    ...items,
  ]
}
