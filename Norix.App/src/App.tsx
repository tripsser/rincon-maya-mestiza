import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { ContextPage } from './features/context/ContextPage'
import { RestaurantContextPage } from './features/tenant/restaurants/RestaurantContextPage'
import { RestaurantsPage } from './features/tenant/restaurants/RestaurantsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contexto" element={<ContextPage />} />
      <Route path="/tenant/restaurantes" element={<RestaurantsPage />} />
      <Route path="/tenant/restaurantes/:id" element={<RestaurantContextPage />} />
    </Routes>
  )
}

export default App
