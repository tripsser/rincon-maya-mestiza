import { useQuery } from '@tanstack/react-query'
import { Outlet, useMatch, useParams } from 'react-router-dom'
import { RestaurantResourceRail } from '../../features/tenant/restaurants/components/RestaurantResourceRail'
import { getRestaurant } from '../../features/tenant/restaurants/api/restaurantsApi'

export function RestaurantPortalLayout() {
  const { id } = useParams<{ id: string }>()
  const branchMatch = useMatch('/tenant/restaurantes/:id/sucursales/:branchId/*')
  const restaurantQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['tenant-restaurant', id],
    queryFn: () => getRestaurant(id!),
  })

  return (
    <div className="flex min-h-0 flex-1">
      <RestaurantResourceRail
        compactOnChild={Boolean(branchMatch)}
        restaurantId={id!}
        restaurantName={restaurantQuery.data?.nombre ?? 'Restaurante / Marca'}
      />
      <Outlet />
    </div>
  )
}
