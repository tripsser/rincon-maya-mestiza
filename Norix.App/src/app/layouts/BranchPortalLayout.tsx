import { useQuery } from '@tanstack/react-query'
import { Outlet, useParams } from 'react-router-dom'
import { getRestaurantBranches } from '../../features/tenant/restaurants/api/restaurantsApi'
import { BranchResourceRail } from '../../features/tenant/restaurants/components/BranchResourceRail'

export function BranchPortalLayout() {
  const { branchId, id } = useParams<{ branchId: string; id: string }>()
  const branchesQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['tenant-restaurant-branches', id],
    queryFn: () => getRestaurantBranches(id!),
  })
  const branches = branchesQuery.data ?? []
  const branch = branches.find((currentBranch) => currentBranch.id === branchId)

  return (
    <>
      <BranchResourceRail
        branchId={branchId!}
        branchName={branch?.nombre ?? 'Unidad operativa / Sucursal'}
        branches={branches}
        restaurantId={id!}
      />
      <Outlet />
    </>
  )
}
