import { useState } from 'react'
import { exportarFichaPDF, exportarFichaExcel } from '../lib/exportar'

export default function FichaCard({
  ave,
  puedeEditar = false,
  puedeActivar = false,
  puedeEliminar = false,
  onEditar,
  onToggleActivo,
  onEliminar,
}) {
  const [expandida, setExpandida] = useState(false)

  return (
    <div className={`ficha-card ${!ave.activo ? 'inactiva' : ''}`}>
      {!ave.activo && (
        <span className="ficha-card-badge-inactiva">INACTIVA</span>
      )}

      <div
        className="ficha-card-header"
        style={{
          backgroundImage: ave.imagen ? `url('${ave.imagen}')` : undefined,
        }}
      >
        <div className="ficha-card-overlay" />
        <div className="ficha-card-header-content">
          <span className="ficha-card-eyebrow">{ave.nombre_cientifico}</span>
          <h2 className="ficha-card-title">{ave.nombre}</h2>
          {ave.estado && (
            <span className="ficha-card-estado">{ave.estado}</span>
          )}
        </div>
      </div>

      <div className="ficha-card-body">
        {ave.descripcion && (
          <p className="ficha-card-desc">{ave.descripcion}</p>
        )}

        {(puedeEditar || puedeActivar || puedeEliminar) && (
          <div className="ficha-card-gestor">
            {puedeEditar && (
              <button className="ficha-gestor-btn editar" onClick={onEditar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
            )}

            {puedeActivar && (
              <button
                className={`ficha-gestor-btn ${ave.activo ? 'desactivar' : 'activar'}`}
                onClick={onToggleActivo}
              >
                {ave.activo ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    Desactivar
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Activar
                  </>
                )}
              </button>
            )}

            {puedeEliminar && (
              <button className="ficha-gestor-btn eliminar" onClick={onEliminar} aria-label="Eliminar ficha">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
              </button>
            )}
          </div>
        )}

        <button
          className="ficha-card-toggle"
          onClick={() => setExpandida((v) => !v)}
        >
          {expandida ? 'Ocultar detalles' : 'Ver detalles completos'}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            style={{
              transform: expandida ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {expandida && (
          <div className="ficha-card-detalles">
            <Seccion titulo="Taxonomía">
              <Fila label="Reino" valor={ave.reino} />
              <Fila label="Filo" valor={ave.filo} />
              <Fila label="Clase" valor={ave.clase} />
              <Fila label="Orden" valor={ave.orden} />
              <Fila label="Familia" valor={ave.familia} />
              <Fila label="Género" valor={ave.genero} />
              <Fila label="Especie" valor={ave.especie} />
            </Seccion>

            <Seccion titulo="Datos biológicos">
              <Fila label="Estado" valor={ave.estado} />
              <Fila label="Hábitat" valor={ave.habitat} />
              <Fila label="Distribución" valor={ave.distribucion} />
              <Fila label="Alimentación" valor={ave.alimentacion} />
              <Fila label="Tamaño" valor={ave.tamano} />
              <Fila label="Peso" valor={ave.peso} />
              <Fila label="Envergadura" valor={ave.envergadura} />
              <Fila label="Vida silvestre" valor={ave.vida_silvestre} />
              <Fila label="Reproducción" valor={ave.reproduccion} />
            </Seccion>

            {ave.amenazas && ave.amenazas.length > 0 && (
              <Seccion titulo="Amenazas">
                <ul className="ficha-lista">
                  {ave.amenazas.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </Seccion>
            )}

            {ave.curiosidades && ave.curiosidades.length > 0 && (
              <Seccion titulo="Curiosidades">
                <ul className="ficha-lista ficha-lista-curiosidades">
                  {ave.curiosidades.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </Seccion>
            )}
          </div>
        )}

        <div className="ficha-card-actions">
          <button
            className="ficha-btn pdf"
            onClick={() => exportarFichaPDF(ave)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            PDF
          </button>

          <button
            className="ficha-btn excel"
            onClick={() => exportarFichaExcel(ave)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M9 13l6 6M15 13l-6 6" />
            </svg>
            Excel
          </button>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="ficha-seccion">
      <h4 className="ficha-seccion-titulo">{titulo}</h4>
      <div className="ficha-seccion-contenido">{children}</div>
    </div>
  )
}

function Fila({ label, valor }) {
  if (!valor) return null
  return (
    <div className="ficha-fila">
      <span className="ficha-fila-label">{label}</span>
      <span className="ficha-fila-valor">{valor}</span>
    </div>
  )
}