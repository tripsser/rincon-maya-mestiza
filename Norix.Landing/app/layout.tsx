import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NORIX SaaS | Sistema operativo para restaurantes',
  description:
    'NORIX organiza administracion, operacion, usuarios, permisos, sucursales y dispositivos para restaurantes multi-marca y multi-sucursal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
