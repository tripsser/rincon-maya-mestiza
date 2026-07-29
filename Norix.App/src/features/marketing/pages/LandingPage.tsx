import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Command,
  CreditCard,
  Cpu,
  DatabaseZap,
  PlugZap,
  Printer,
  ReceiptText,
  LockKeyhole,
  Menu,
  MonitorCog,
  Store,
  Utensils,
  Workflow,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { NorixMark } from '../../../shared/ui/NorixMark'
import './LandingPage.css'

const navigation = ['Plataforma', 'Contexto', 'Operacion', 'Arquitectura']

const capabilities = [
  {
    icon: <Building2 size={22} />,
    title: 'Tenant',
    body: 'Identidad, usuarios, permisos, fiscalidad y estructura global.',
  },
  {
    icon: <Store size={22} />,
    title: 'Marca',
    body: 'Restaurantes, sucursales, catalogo y administracion por marca.',
  },
  {
    icon: <Utensils size={22} />,
    title: 'Sucursal',
    body: 'Mesas, comandas, cocina, caja, clientes y dispositivos.',
  },
]

const serviceRows = [
  ['Acceso contextual', 'Roles y permisos por tenant, restaurante y unidad operativa.'],
  ['Operacion conectada', 'Comandas, caja, cocina y dispositivos bajo el mismo contexto.'],
  ['Infraestructura lista', 'PostgreSQL, Redis, JWT, Identity y despliegue por contenedores.'],
]

const flow = [
  ['01', 'Login seguro', 'JWT corto, cookie httpOnly y sesion distribuida en Redis.'],
  ['02', 'Contexto activo', 'El usuario trabaja sobre tenant, marca o sucursal.'],
  ['03', 'Permisos efectivos', 'NORIX calcula lo que puede ver y ejecutar en ese alcance.'],
  ['04', 'Operacion real', 'La interfaz muestra solo lo necesario para ese recurso.'],
]

const operatingModules = [
  { icon: <ReceiptText size={20} />, title: 'Comandas', body: 'Flujo operativo por mesa, cocina, caja y estado.' },
  { icon: <Printer size={20} />, title: 'Dispositivos', body: 'Agentes locales, impresoras y activos por sucursal.' },
  { icon: <CreditCard size={20} />, title: 'Caja', body: 'Pagos, cortes y actividad en contexto operativo.' },
  { icon: <PlugZap size={20} />, title: 'Integraciones', body: 'Preparado para automatizaciones y servicios conectados.' },
]

export function LandingPage() {
  return (
    <main className="nrx-landing">
      <Hero />
      <SignalStrip />
      <CapabilityBand />
      <LivingComponents />
      <Services />
      <AutomationStack />
      <ContextShowcase />
      <OperatingFlow />
      <FinalCallToAction />
    </main>
  )
}

function LivingComponents() {
  return (
    <section className="nrx-section nrx-living-components" aria-labelledby="living-components-title">
      <div className="nrx-living-heading">
        <p className="nrx-kicker">
          <Command size={15} />
          Componentes vivos
        </p>
        <h2 id="living-components-title">Piezas del portal que explican la operacion sin abrir otro sistema.</h2>
      </div>

      <div className="nrx-live-grid">
        <article className="nrx-live-card nrx-live-card-context">
          <div className="nrx-live-visual">
            <span className="nrx-live-pill">Tenant</span>
            <span className="nrx-live-pill">La Mestiza</span>
            <span className="nrx-live-pill">Centro</span>
            <i />
          </div>
          <h3>Contexto activo</h3>
          <p>La jerarquia tenant, marca y sucursal se mantiene visible mientras el usuario trabaja.</p>
        </article>

        <article className="nrx-live-card nrx-live-card-order">
          <div className="nrx-live-visual">
            <div className="nrx-mini-window">
              <span>Comanda #C-0254</span>
              <strong>Mesa 12 enviada a cocina</strong>
              <small>Preparacion iniciada</small>
            </div>
          </div>
          <h3>Operacion en tiempo real</h3>
          <p>Comandas, cocina y caja se leen como eventos vivos dentro del mismo contexto.</p>
        </article>

        <article className="nrx-live-card nrx-live-card-device">
          <div className="nrx-live-visual">
            <div className="nrx-device-node">
              <Printer size={22} />
              <span>Cocina 1</span>
            </div>
            <div className="nrx-device-node">
              <MonitorCog size={22} />
              <span>Agente local</span>
            </div>
            <i />
          </div>
          <h3>Dispositivos conectados</h3>
          <p>Impresoras, agentes y activos se ven como infraestructura operativa, no como configuracion escondida.</p>
        </article>

        <article className="nrx-live-card nrx-live-card-access">
          <div className="nrx-live-visual">
            <div className="nrx-access-chip">
              <ShieldCheck size={20} />
              <span>Permiso efectivo</span>
            </div>
            <div className="nrx-access-lines">
              <span />
              <span />
              <span />
            </div>
          </div>
          <h3>Acceso calculado</h3>
          <p>La interfaz responde al alcance del usuario sin depender de claims inflados.</p>
        </article>
      </div>
    </section>
  )
}

function Hero() {
  return (
    <section className="nrx-hero" aria-labelledby="landing-title">
      <div className="nrx-hero-beams" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="nrx-nav" aria-label="Navegacion principal">
        <Link className="nrx-brand" to="/" aria-label="NORIX inicio">
          <NorixMark compact />
          <span>
            NORIX
            <small>SAAS</small>
          </span>
        </Link>

        <nav className="nrx-nav-links" aria-label="Secciones de landing">
          {navigation.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </nav>

        <div className="nrx-nav-actions">
          <Link className="nrx-login" to="/login">
            Entrar
            <LockKeyhole size={16} />
          </Link>
          <button className="nrx-menu" type="button" aria-label="Abrir menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div className="nrx-hero-grid">
        <div className="nrx-hero-copy">
          <p className="nrx-kicker">
            <CircleDot size={15} />
            Sistema operativo restaurantero
          </p>
          <h1 id="landing-title">ERP y CRM para operar restaurantes como una plataforma.</h1>
          <p>
            NORIX une administracion, contexto operativo, usuarios, permisos,
            sucursales y dispositivos en un solo portal para duenos de restaurantes
            y marcas.
          </p>

          <div className="nrx-hero-actions">
            <Link className="nrx-button nrx-button-primary" to="/login">
              Explorar portal
              <ArrowUpRight size={20} />
            </Link>
            <a className="nrx-button nrx-button-secondary" href="#contexto">
              Ver arquitectura
              <ArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="nrx-product-stage" aria-label="Vista sintetica del portal NORIX">
          <div className="nrx-command-card">
            <Command size={16} />
            <span>
              Nueva comanda detectada
              <small>Mesa 12, cocina caliente, 2 min</small>
            </span>
            <b>Asignar</b>
          </div>
          <div className="nrx-energy-field" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="nrx-floating-chip nrx-floating-chip-tenant">
            <Building2 size={16} />
            Tenant
          </div>
          <div className="nrx-floating-chip nrx-floating-chip-brand">
            <Store size={16} />
            Marca
          </div>
          <div className="nrx-floating-chip nrx-floating-chip-branch">
            <Utensils size={16} />
            Sucursal
          </div>
          <div className="nrx-stage-orbit" aria-hidden="true" />
          <PortalPreview />
          <div className="nrx-stage-dock" aria-hidden="true">
            <span>Cocina</span>
            <span>Caja</span>
            <span>Mesas</span>
          </div>
        </div>
      </div>

      <div className="nrx-hero-footer" aria-label="Principios de plataforma">
        <span>Multiinquilino</span>
        <span>Multimarca</span>
        <span>Multisucursal</span>
        <span>Context-ready</span>
      </div>
    </section>
  )
}

function SignalStrip() {
  return (
    <section className="nrx-signal-strip" aria-label="Capas operativas de NORIX">
      {['Tenant', 'Marca', 'Sucursal', 'Catalogo', 'Comandas', 'Caja', 'Cocina', 'Dispositivos'].map(
        (item) => (
          <span key={item}>{item}</span>
        ),
      )}
    </section>
  )
}

function PortalPreview() {
  return (
    <div className="nrx-preview">
      <div className="nrx-preview-sidebar">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="nrx-preview-main">
        <div className="nrx-preview-bar">
          <span>Grupo Gourmet</span>
          <small>Contexto sincronizado</small>
        </div>
        <div className="nrx-context-chain">
          <span>Tenant</span>
          <ChevronRight size={16} />
          <span>La Mestiza</span>
          <ChevronRight size={16} />
          <span>Centro</span>
        </div>
        <div className="nrx-preview-grid">
          <div>
            <strong>24</strong>
            <span>Comandas activas</span>
          </div>
          <div>
            <strong>8</strong>
            <span>Mesas ocupadas</span>
          </div>
          <div>
            <strong>6</strong>
            <span>Dispositivos</span>
          </div>
        </div>
        <div className="nrx-preview-list">
          <span>
            <i />
            Comanda #C-0254 enviada a cocina
          </span>
          <span>
            <i />
            Caja Centro registro venta
          </span>
          <span>
            <i />
            Impresora Cocina conectada
          </span>
        </div>
      </div>
    </div>
  )
}

function CapabilityBand() {
  return (
    <section className="nrx-section nrx-capability-band" id="plataforma">
      <div className="nrx-section-heading">
        <p className="nrx-kicker">
          <Cpu size={15} />
          Plataforma por recursos
        </p>
        <h2>Un negocio restaurantero no es una lista de modulos. Es una jerarquia.</h2>
        <div className="nrx-section-pulse" aria-hidden="true" />
      </div>
      <div className="nrx-capabilities">
        {capabilities.map((capability) => (
          <article key={capability.title} className="nrx-capability">
            <div>{capability.icon}</div>
            <h3>{capability.title}</h3>
            <p>{capability.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="nrx-section nrx-services">
      <article className="nrx-large-panel">
        <div className="nrx-panel-beam" aria-hidden="true" />
        <p className="nrx-kicker">
          <DatabaseZap size={15} />
          Capacidades base
        </p>
        <h2>La administracion y la operacion viven en el mismo sistema.</h2>
        <p>
          NORIX separa responsabilidades por nivel, pero mantiene una experiencia
          continua para que el dueno entienda todo el negocio sin brincar entre
          herramientas.
        </p>
      </article>

      <div className="nrx-service-list">
        <div className="nrx-service-thread" aria-hidden="true" />
        {serviceRows.map(([title, body]) => (
          <article key={title} className="nrx-service-row">
            <CheckCircle2 size={22} />
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
            <ArrowUpRight size={20} />
          </article>
        ))}
      </div>
    </section>
  )
}

function AutomationStack() {
  return (
    <section className="nrx-section nrx-automation-stack">
      <div className="nrx-stack-visual">
        <svg className="nrx-stack-links" viewBox="0 0 680 360" aria-hidden="true">
          <path d="M120 92 C220 92 238 174 324 174" />
          <path d="M120 182 C210 182 246 190 324 190" />
          <path d="M120 272 C220 272 238 206 324 206" />
          <path d="M360 176 C452 142 468 100 560 94" />
          <path d="M360 202 C458 230 472 272 560 276" />
        </svg>

        <div className="nrx-stack-node nrx-stack-node-source">
          <ReceiptText size={18} />
          <span>Mesa 12</span>
          <small>Comanda nueva</small>
        </div>

        <div className="nrx-stack-node nrx-stack-node-source nrx-stack-node-second">
          <CreditCard size={18} />
          <span>Caja</span>
          <small>Venta abierta</small>
        </div>

        <div className="nrx-stack-node nrx-stack-node-source nrx-stack-node-third">
          <Store size={18} />
          <span>Sucursal</span>
          <small>Centro</small>
        </div>

        <div className="nrx-stack-card nrx-stack-card-main">
          <NorixMark compact />
          <span>Operacion en vivo</span>
          <strong>Contexto activo</strong>
          <small>La Mestiza / Centro</small>
        </div>

        <div className="nrx-stack-node nrx-stack-node-target">
          <Printer size={18} />
          <span>Cocina 1</span>
          <small>Impresora lista</small>
        </div>

        <div className="nrx-stack-node nrx-stack-node-target nrx-stack-node-target-second">
          <ShieldCheck size={18} />
          <span>Permiso</span>
          <small>Validado</small>
        </div>
      </div>

      <div className="nrx-stack-copy">
        <p className="nrx-kicker">
          <Workflow size={15} />
          Workflows restauranteros
        </p>
        <h2>La plataforma entiende quien eres, donde estas y que puedes operar.</h2>
        <div className="nrx-module-grid">
          {operatingModules.map((module) => (
            <article key={module.title}>
              <div>{module.icon}</div>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContextShowcase() {
  return (
    <section className="nrx-section nrx-context-showcase" id="contexto">
      <div className="nrx-context-copy">
        <div className="nrx-panel-beam" aria-hidden="true" />
        <p className="nrx-kicker">
          <MonitorCog size={15} />
          Contexto de trabajo
        </p>
        <h2>No abre otro portal. Cambia el recurso actual.</h2>
        <p>
          Cuando el usuario entra a una marca o sucursal, el menu se adapta al
          alcance activo. Es la filosofia de recursos tipo Azure, llevada al
          dominio restaurantero.
        </p>
      </div>

      <div className="nrx-rail-demo" aria-label="Demostracion sintetica de rails jerarquicos">
        <div className="nrx-rail-signal" aria-hidden="true" />
        <div className="nrx-rail nrx-rail-tenant">
          <strong>Tenant</strong>
          <span>Grupo Gourmet</span>
          <i />
          <i />
          <i />
        </div>
        <div className="nrx-rail nrx-rail-brand">
          <strong>Marca</strong>
          <span>La Mestiza</span>
          <i />
          <i />
          <i />
        </div>
        <div className="nrx-rail nrx-rail-branch">
          <strong>Sucursal</strong>
          <span>Centro</span>
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  )
}

function OperatingFlow() {
  return (
    <section className="nrx-section nrx-flow" id="operacion">
      <div className="nrx-section-heading">
        <p className="nrx-kicker">
          <CircleDot size={15} />
          Del login a la operacion
        </p>
        <h2>El flujo tecnico se vuelve una experiencia clara.</h2>
      </div>

      <div className="nrx-flow-list">
        {flow.map(([number, title, body]) => (
          <article key={number} className="nrx-flow-item">
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FinalCallToAction() {
  return (
    <section className="nrx-section nrx-final" id="arquitectura">
      <article>
        <p className="nrx-kicker">
          <CircleDot size={15} />
          Built for real restaurants
        </p>
        <h2>Opera, controla, conecta y crece desde un solo contexto.</h2>
        <Link className="nrx-button nrx-button-primary" to="/login">
          Entrar a NORIX
          <ArrowRight size={20} />
        </Link>
      </article>
    </section>
  )
}
