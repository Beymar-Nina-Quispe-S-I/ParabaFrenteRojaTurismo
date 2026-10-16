import { useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../hooks/useDashboard'

const COLORES_AVIST = ['#5c8264', '#c6862e', '#c0392b']
const COLORES_RUTAS = ['#326e7a', '#c6862e', '#c0392b']
const COLORES_ROLES = ['#d6483f', '#c6862e', '#326e7a', '#5c8264', '#8f8da6']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="chart-tooltip">
      {label && <strong>{label}</strong>}
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-row">
          <span
            className="chart-tooltip-dot"
            style={{ background: p.payload.fill || p.color }}
          />
          <span className="chart-tooltip-name">{p.name}</span>
          <span className="chart-tooltip-val">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardView({ onToast }) {
  const { stats, loading, ultimaActualizacion, cargar } = useDashboard()

  useEffect(() => {
    cargar()
  }, [cargar])

  function handleRefresh() {
    cargar()
    onToast && onToast('Estadísticas actualizadas', 'success')
  }

  if (!stats && loading) {
    return (
      <div className="mobile-view active">
        <header className="mobile-view-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 3v18h18M7 14l4-4 4 4 6-6" />
          </svg>
          <span>Dashboard</span>
        </header>
        <div className="mobile-card">
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        </div>
      </div>
    )
  }

  const s = stats || {}

  const cards = [
    { label: 'Usuarios', valor: s.usuarios_total, color: 'azul' },
    { label: 'Activos ahora', valor: s.usuarios_activos, color: 'verde' },
    { label: 'Avistamientos', valor: s.avistamientos_total, color: 'rojo' },
    { label: 'Rutas', valor: s.rutas_total, color: 'ocre' },
  ]

  const avistData = [
    { name: 'Aprobados', value: s.avistamientos_aprobados || 0 },
    { name: 'Pendientes', value: s.avistamientos_pendientes || 0 },
    { name: 'Rechazados', value: s.avistamientos_rechazados || 0 },
  ]

  const rutasData = [
    { name: 'Aprobadas', value: s.rutas_aprobadas || 0 },
    { name: 'Pendientes', value: s.rutas_pendientes || 0 },
    { name: 'Rechazadas', value: s.rutas_rechazadas || 0 },
  ]

  const rolData = (s.usuarios_por_rol || []).map((r) => ({
    name: r.rol,
    value: r.total,
  }))

  const actividadData = (s.actividad_ultimos_7_dias || []).map((d) => ({
    name: new Date(d.fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
    }),
    total: d.total,
  }))

  const topUsuarios = s.top_usuarios || []

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 3v18h18M7 14l4-4 4 4 6-6" />
        </svg>
        <span>Dashboard</span>
      </header>

      <div className="dashboard-refresh">
        <span className="dashboard-fecha">
          {ultimaActualizacion
            ? `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-BO', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Sin datos'}
        </span>
        <button
          className="dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v6h6M20 20v-6h-6" />
            <path d="M20 8A8 8 0 006 5.3L4 10m16 4l-2 4.7A8 8 0 014 16" />
          </svg>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="dashboard-cards">
        {cards.map((c, i) => (
          <div key={i} className={`dashboard-card color-${c.color}`}>
            <div className="dashboard-card-value">{c.valor ?? '—'}</div>
            <div className="dashboard-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Avistamientos */}
      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
          </svg>
          Avistamientos por estado
        </h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={avistData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ value }) => (value > 0 ? value : '')}
                labelLine={false}
              >
                {avistData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORES_AVIST[index % COLORES_AVIST.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="chart-legend-label">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rutas */}
      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
          </svg>
          Rutas por estado
        </h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={rutasData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ value }) => (value > 0 ? value : '')}
                labelLine={false}
              >
                {rutasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORES_RUTAS[index % COLORES_RUTAS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="chart-legend-label">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usuarios por rol */}
      {rolData.length > 0 && (
        <div className="mobile-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usuarios por rol
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={rolData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ value }) => (value > 0 ? value : '')}
                  labelLine={false}
                >
                  {rolData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES_ROLES[index % COLORES_ROLES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="chart-legend-label">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Actividad últimos 7 días */}
      {actividadData.length > 0 && (
        <div className="mobile-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 3v18h18M7 14l4-4 4 4 6-6" />
            </svg>
            Actividad últimos 7 días
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={actividadData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#8f8da6' }}
                  axisLine={{ stroke: '#e7e5de' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8f8da6' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f4f3ef' }}
                />
                <Bar
                  dataKey="total"
                  name="Eventos"
                  fill="#d6483f"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top usuarios */}
      {topUsuarios.length > 0 && (
        <div className="mobile-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Top usuarios activos
          </h3>

          <div className="top-usuarios-list">
            {topUsuarios.map((u, i) => (
              <div key={i} className="top-usuario-item">
                <span className="top-usuario-pos">{i + 1}</span>
                <span className="top-usuario-nombre">{u.nombre}</span>
                <span className="top-usuario-total">{u.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}