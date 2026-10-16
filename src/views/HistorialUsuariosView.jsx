import { useEffect, useMemo, useState } from 'react'
import { sb } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { exportarHistorialPDF } from '../lib/exportar'

function fechaInput(fecha) {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function rangoInicial() {
  const hasta = new Date()
  const desde = new Date()
  desde.setDate(desde.getDate() - 30)
  return { desde: fechaInput(desde), hasta: fechaInput(hasta) }
}

function fechaLocalDesdeInput(fecha, fin = false) {
  const date = new Date(`${fecha}T${fin ? '23:59:59.999' : '00:00:00'}`)
  return date.toISOString()
}

function estadoSolicitud(estado) {
  const valor = (estado || 'pendiente').toLowerCase()
  if (['aprobado', 'aprobada', 'aceptado', 'aceptada'].includes(valor)) return 'aceptada'
  if (['rechazado', 'rechazada'].includes(valor)) return 'rechazada'
  return 'pendiente'
}

function construirEventosSolicitud(registros, tipo) {
  return (registros || []).flatMap((registro) => {
    const estado = estadoSolicitud(registro.estado || registro.estado_revision)
    const titulo = registro.nombre || registro.especie || `Registro #${registro.id}`
    const entidad = tipo === 'avistamiento' ? 'Avistamiento' : 'Ruta comunitaria'
    const eventos = [{
      id: `${tipo}-${registro.id}-registro`,
      categoria: 'solicitud',
      fecha: registro.created_at,
      accion: `Solicitud de ${entidad.toLowerCase()} registrada`,
      titulo,
      entidad,
      estado: estado === 'pendiente' ? 'pendiente' : 'registrada',
      detalle: [registro.lugar, registro.ciudad, registro.descripcion].filter(Boolean).join(' · '),
    }]

    if (estado !== 'pendiente') {
      eventos.push({
        id: `${tipo}-${registro.id}-${estado}`,
        categoria: 'solicitud',
        fecha: registro.aprobado_en || registro.created_at,
        accion: estado === 'aceptada' ? 'Solicitud aceptada' : 'Solicitud rechazada',
        titulo,
        entidad,
        estado,
        detalle: estado === 'rechazada' ? registro.motivo_rechazo || 'Sin motivo indicado' : 'Registro aprobado',
      })
    }

    return eventos
  })
}

function eventoAuditoria(log) {
  const acceso = ['login', 'logout'].includes(log.accion)
  return {
    id: `auditoria-${log.id}`,
    categoria: acceso ? 'acceso' : 'actividad',
    fecha: log.created_at,
    accion: (log.accion || 'actividad').replace(/_/g, ' '),
    titulo: log.entidad || 'Cuenta de usuario',
    entidad: log.entidad || '',
    estado: '',
    detalle: [log.entidad_id ? `Registro #${log.entidad_id}` : '', log.detalles?.motivo || ''].filter(Boolean).join(' · '),
  }
}

export default function HistorialUsuariosView({ onToast }) {
  const { user: operador } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [rango, setRango] = useState(rangoInicial)
  const [tipo, setTipo] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [eventos, setEventos] = useState(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function cargarUsuarios() {
      const { data, error } = await sb
        .from('users')
        .select('id, nombre, email, usuario')
        .order('nombre')
      if (cancelado) return
      if (error) onToast?.(`No se pudieron cargar los usuarios: ${error.message}`, 'error')
      setUsuarios(data || [])
      setLoadingUsuarios(false)
    }
    cargarUsuarios()
    return () => { cancelado = true }
  }, [onToast])

  async function consultar() {
    if (!usuarioId) {
      onToast?.('Selecciona un usuario para consultar su historial', 'error')
      return
    }
    if (!rango.desde || !rango.hasta || rango.desde > rango.hasta) {
      onToast?.('Revisa el rango de fechas', 'error')
      return
    }

    setLoading(true)
    const id = Number(usuarioId)
    const desde = fechaLocalDesdeInput(rango.desde)
    const hasta = fechaLocalDesdeInput(rango.hasta, true)

    const [auditoria, avistamientos, rutas] = await Promise.all([
      sb.from('auditoria')
        .select('id, user_id, accion, entidad, entidad_id, detalles, created_at')
        .eq('user_id', id)
        .gte('created_at', desde)
        .lte('created_at', hasta)
        .order('created_at', { ascending: false })
        .limit(1000),
      sb.from('avistamientos')
        .select('id, user_id, especie, cantidad, lugar, ciudad, descripcion, created_at, estado, aprobado_en, motivo_rechazo')
        .eq('user_id', id)
        .limit(1000),
      sb.from('rutas')
        .select('id, user_id, nombre, especie, ciudad, descripcion, created_at, estado, aprobado_en, motivo_rechazo')
        .eq('user_id', id)
        .limit(1000),
    ])

    const error = auditoria.error || avistamientos.error || rutas.error
    if (error) onToast?.(`No se completó la consulta: ${error.message}`, 'error')

    const solicitudes = [
      ...construirEventosSolicitud(avistamientos.data, 'avistamiento'),
      ...construirEventosSolicitud(rutas.data, 'ruta'),
    ].filter((evento) => {
      const fecha = new Date(evento.fecha)
      return fecha >= new Date(desde) && fecha <= new Date(hasta)
    })

    const combinados = [
      ...(auditoria.data || []).map(eventoAuditoria),
      ...solicitudes,
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    setEventos(combinados)
    setLoading(false)
  }

  const usuarioSeleccionado = usuarios.find((item) => String(item.id) === usuarioId)
  const filtrados = useMemo(() => (eventos || []).filter((evento) => {
    const coincideTipo = tipo === 'todos' || evento.categoria === tipo
    const coincideEstado = estado === 'todos' || evento.estado === estado
    return coincideTipo && coincideEstado
  }), [eventos, tipo, estado])

  const resumen = useMemo(() => ({
    accesos: filtrados.filter((evento) => evento.categoria === 'acceso').length,
    aceptadas: filtrados.filter((evento) => evento.estado === 'aceptada').length,
    rechazadas: filtrados.filter((evento) => evento.estado === 'rechazada').length,
  }), [filtrados])

  function descargarPDF() {
    if (!usuarioSeleccionado || !filtrados.length) return
    exportarHistorialPDF({
      usuario: usuarioSeleccionado,
      eventos: filtrados,
      desde: rango.desde,
      hasta: rango.hasta,
      generadoPor: operador?.nombre || operador?.usuario || 'Administrador',
    })
    onToast?.('Reporte PDF descargado', 'success')
  }

  return (
    <div className="mobile-view active historial-view">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
          <path d="M3 3v5h5m4-1v5l3 2" />
        </svg>
        <span>Historial personal</span>
      </header>

      <section className="historial-filtros">
        <div className="historial-filtros-title">
          <div>
            <h2>Reporte de actividad</h2>
            <p>Accesos, acciones y resoluciones de solicitudes por usuario.</p>
          </div>
          <button className="historial-exportar" onClick={descargarPDF} disabled={!filtrados.length}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
            </svg>
            PDF
          </button>
        </div>

        <div className="historial-filtros-grid">
          <label>
            Usuario
            <select value={usuarioId} onChange={(event) => setUsuarioId(event.target.value)} disabled={loadingUsuarios}>
              <option value="">{loadingUsuarios ? 'Cargando usuarios…' : 'Selecciona usuario'}</option>
              {usuarios.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre || item.usuario} {item.usuario ? `(@${item.usuario})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input type="date" value={rango.desde} max={rango.hasta} onChange={(event) => setRango((actual) => ({ ...actual, desde: event.target.value }))} />
          </label>
          <label>
            Hasta
            <input type="date" value={rango.hasta} min={rango.desde} onChange={(event) => setRango((actual) => ({ ...actual, hasta: event.target.value }))} />
          </label>
          <label>
            Tipo de reporte
            <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option value="todos">Todos los eventos</option>
              <option value="acceso">Entradas y salidas</option>
              <option value="solicitud">Solicitudes</option>
              <option value="actividad">Otras acciones</option>
            </select>
          </label>
          <label>
            Estado
            <select value={estado} onChange={(event) => setEstado(event.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
              <option value="registrada">Registrada</option>
            </select>
          </label>
          <button className="historial-consultar" onClick={consultar} disabled={loading || loadingUsuarios}>
            {loading ? 'Consultando…' : 'Consultar historial'}
          </button>
        </div>
      </section>

      {eventos && (
        <>
          <section className="historial-resumen" aria-label="Resumen de actividad">
            <div><strong>{filtrados.length}</strong><span>Eventos</span></div>
            <div><strong>{resumen.accesos}</strong><span>Entradas/salidas</span></div>
            <div><strong>{resumen.aceptadas}</strong><span>Aceptadas</span></div>
            <div><strong>{resumen.rechazadas}</strong><span>Rechazadas</span></div>
          </section>

          <section className="historial-eventos">
            <header>
              <div>
                <h3>{usuarioSeleccionado?.nombre || usuarioSeleccionado?.usuario || 'Usuario'}</h3>
                <span>{rango.desde} a {rango.hasta}</span>
              </div>
              <span>{filtrados.length} registros</span>
            </header>
            {filtrados.length === 0 ? (
              <div className="empty-state"><p>No hay eventos para esos filtros.</p></div>
            ) : (
              <ol>
                {filtrados.map((evento) => (
                  <li key={evento.id} className={`historial-evento ${evento.estado}`}>
                    <span className="historial-evento-punto" />
                    <div className="historial-evento-contenido">
                      <div className="historial-evento-titulo">
                        <strong>{evento.accion}</strong>
                        {evento.estado && <span className={`historial-estado ${evento.estado}`}>{evento.estado}</span>}
                      </div>
                      <span>{evento.titulo}{evento.entidad ? ` · ${evento.entidad}` : ''}</span>
                      {evento.detalle && <p>{evento.detalle}</p>}
                    </div>
                    <time dateTime={evento.fecha}>{new Date(evento.fecha).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'medium' })}</time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
      {!eventos && !loading && <div className="empty-state historial-vacio"><p>Selecciona un usuario y un rango de fechas para consultar su historial.</p></div>}
    </div>
  )
}
