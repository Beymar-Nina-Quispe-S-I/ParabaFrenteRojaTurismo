import React from 'react';

const BIRD_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23e9f1e8"/><circle cx="200" cy="120" r="40" fill="%2324513d" opacity="0.85"/><polygon points="230,116 255,120 230,124" fill="%23f57f17"/><circle cx="210" cy="112" r="4" fill="%23ffffff"/><text x="200" y="200" text-anchor="middle" fill="%2324513d" font-family="sans-serif" font-size="14" font-weight="bold">Fotograf%C3%ADa de campo</text></svg>`;

export default function FichaDetalle({ ave }) {
  if (!ave) {
    return <p className="coordinates-empty">No hay ninguna ficha de ave seleccionada.</p>;
  }

  const badgeClass = `badge-estado badge-${(ave.estado_uicn || 'lc').toLowerCase()}`;

  return (
    <div className="ficha-detalle-box">
      
      {/* 1. Encabezado principal de la especie */}
      <div className="ficha-encabezado-react">
        <div>
          <h2>{ave.nombre_comun}</h2>
          <span className="subtitulo-cientifico-destacado">
            <em>{ave.nombre_cientifico}</em>
            {ave.autor_taxonomico && (
              <small style={{ marginLeft: '8px', color: '#68776e', fontStyle: 'normal', fontSize: '0.88rem' }}>
                ({ave.autor_taxonomico})
              </small>
            )}
          </span>
        </div>

        <div>
          <span className={badgeClass}>
            {ave.estado_uicn} &middot; {ave.estado_texto || ave.estado_uicn}
          </span>
        </div>
      </div>

      {/* 2. Barra de Métricas Clave de Identificación */}
      <div className="ficha-metricas-rapidas">
        <div className="metrica-tarjeta">
          <span className="metrica-etiqueta">Longitud</span>
          <span className="metrica-valor">{ave.tamano || 'No registrado'}</span>
        </div>
        <div className="metrica-tarjeta">
          <span className="metrica-etiqueta">Envergadura Alar</span>
          <span className="metrica-valor">{ave.envergadura || 'No registrada'}</span>
        </div>
        <div className="metrica-tarjeta">
          <span className="metrica-etiqueta">Peso Promedio</span>
          <span className="metrica-valor">{ave.peso || 'No registrado'}</span>
        </div>
        <div className="metrica-tarjeta">
          <span className="metrica-etiqueta">Endemismo</span>
          <span className="metrica-valor">{ave.endemismo || 'Nativa'}</span>
        </div>
      </div>

      {/* 3. Fotografía de Campo y Tabla Técnica Completa */}
      <div className="ficha-foto-tabla-grid">
        <div className="ficha-foto-caja">
          <img 
            src={ave.imagen_url || BIRD_PLACEHOLDER} 
            alt={ave.nombre_comun} 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BIRD_PLACEHOLDER;
            }}
          />
          <div className="foto-pie-caption">
            <span>📷 Espécimen verificado en hábitat (Omereque)</span>
          </div>
        </div>

        <table className="tabla-datos">
          <tbody>
            <tr>
              <th>Nombre científico:</th>
              <td><em>{ave.nombre_cientifico}</em></td>
            </tr>
            <tr>
              <th>Autor taxonómico:</th>
              <td>{ave.autor_taxonomico || 'Sin registro'}</td>
            </tr>
            <tr>
              <th>Familia:</th>
              <td>{ave.familia || 'Psittacidae'}</td>
            </tr>
            <tr>
              <th>Orden:</th>
              <td>{ave.orden || 'Psittaciformes'}</td>
            </tr>
            <tr>
              <th>Estado de Conservación:</th>
              <td>
                <span className={badgeClass} style={{ marginRight: '6px' }}>{ave.estado_uicn}</span>
                <strong>{ave.estado_texto || ave.estado_uicn}</strong>
              </td>
            </tr>
            <tr>
              <th>Población silvestre:</th>
              <td>{ave.poblacion_estimada || 'En estudio'}</td>
            </tr>
            <tr>
              <th>Rango altitudinal:</th>
              <td>{ave.rango_altitudinal || 'Valles interandinos'}</td>
            </tr>
            <tr>
              <th>Horario de avistamiento:</th>
              <td>{ave.horario_avistamiento || 'Mañanas y tardes'}</td>
            </tr>
            <tr>
              <th>Temporada ideal:</th>
              <td>{ave.temporada_ideal || 'Septiembre a Marzo'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Secciones Informativas Detalladas de Campo */}
      <div className="ficha-secciones-grid">
      
        {/* Morfología */}
        <div className="ficha-seccion-item">
          <h4>🪶 Descripción física y plumaje</h4>
          <p>{ave.descripcion || 'Sin descripción física registrada.'}</p>
        </div>

        {/* Hábitat y Distribución */}
        <div className="ficha-seccion-item">
          <h4>🌿 Hábitat y distribución geográfica</h4>
          <p>{ave.habitat || 'Sin información de hábitat.'}</p>
          {ave.distribucion && (
            <p style={{ marginTop: '8px', fontSize: '0.84rem', color: '#44564c', borderTop: '1px dashed #cad8cc', paddingTop: '6px' }}>
              <strong>Distribución regional:</strong> {ave.distribucion}
            </p>
          )}
        </div>

        {/* Dieta */}
        <div className="ficha-seccion-item">
          <h4>🌾 Alimentación y dieta en campo</h4>
          <p>{ave.alimentacion || 'Sin datos de alimentación registrados.'}</p>
        </div>

        {/* Reproducción */}
        <div className="ficha-seccion-item">
          <h4>🥚 Reproducción y sitios de anidación</h4>
          <p>{ave.reproduccion || 'Sin datos de reproducción registrados.'}</p>
        </div>

        {/* Conservación y Amenazas */}
        <div className="ficha-seccion-item ficha-destacada">
          <h4>⚠️ Estado de conservación y amenazas principales</h4>
          <p>{ave.conservacion || 'Sin información de conservación.'}</p>
          {ave.amenazas && (
            <p style={{ marginTop: '8px', fontSize: '0.84rem', color: '#8a2b25', borderTop: '1px dashed #eed0c8', paddingTop: '6px' }}>
              <strong>Amenazas identificadas:</strong> {ave.amenazas}
            </p>
          )}
        </div>

        {/* Recomendaciones para el Observador */}
        {ave.recomendaciones_observador && (
          <div className="ficha-seccion-item" style={{ background: '#f4f6f1', borderLeft: '4px solid #526359' }}>
            <h4>🔭 Recomendaciones para el observador en campo</h4>
            <p>{ave.recomendaciones_observador}</p>
          </div>
        )}

      </div>

    </div>
  );
}
