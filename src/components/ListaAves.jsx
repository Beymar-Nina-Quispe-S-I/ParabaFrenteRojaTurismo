import React from 'react';

export default function ListaAves({
  aves,
  idSeleccionado,
  textoFiltro,
  onCambiarFiltro,
  onSeleccionarAve
}) {
  const filtradas = aves.filter(ave => {
    if (!textoFiltro) return true;
    const q = textoFiltro.toLowerCase().trim();
    return (
      ave.nombre_comun?.toLowerCase().includes(q) ||
      ave.nombre_cientifico?.toLowerCase().includes(q) ||
      ave.familia?.toLowerCase().includes(q) ||
      ave.rutas_mapa?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="coordinates-list-panel">
      
      {/* Cabecera del Catálogo */}
      <div className="coordinates-panel-title">
        <div>
          <h3>Aves registradas</h3>
          <p>Especies de los valles secos del Río Mizque.</p>
        </div>
      </div>

      {/* Buscador interactivo */}
      <div style={{ margin: '14px 0 12px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre común o científico..." 
          value={textoFiltro}
          onChange={(e) => onCambiarFiltro(e.target.value)}
          className="buscador-input"
        />
      </div>

      {/* Lista de tarjetas clicables */}
      <div className="coordinates-route-list">
        {filtradas.length === 0 ? (
          <p className="coordinates-empty">No se encontraron aves con ese criterio de búsqueda.</p>
        ) : (
          filtradas.map(ave => {
            const isSelected = ave.id === idSeleccionado;
            const badgeClass = `badge-estado badge-${(ave.estado_uicn || 'lc').toLowerCase()}`;
            const colorBarra = ave.color_identificador || '#24513d';

            return (
              <article 
                key={ave.id}
                className={`coordinates-route-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSeleccionarAve(ave.id)}
                title={`Haz clic para ver la ficha técnica de ${ave.nombre_comun}`}
              >
                {/* Borde de color UICN */}
                <div className="coordinates-route-color" style={{ background: colorBarra }}></div>
                
                <div className="tarjeta-ave-cuerpo">
                  {/* Miniatura de la fotografía de campo */}
                  <div className="tarjeta-ave-thumb-caja">
                    <img 
                      src={ave.imagen_url || '/favicon.svg'} 
                      alt={ave.nombre_comun}
                      className="tarjeta-ave-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/favicon.svg';
                      }}
                    />
                  </div>

                  {/* Información concisa de la especie */}
                  <div className="coordinates-route-card-content">
                    <div className="coordinates-route-card-top">
                      <h4>{ave.nombre_comun}</h4>
                      <span className={badgeClass}>{ave.estado_uicn}</span>
                    </div>
                    <small className="subtitulo-cientifico">{ave.nombre_cientifico}</small>
                    <p className="descripcion-corta">
                      {ave.descripcion ? ave.descripcion.substring(0, 85) + '...' : 'Ficha técnica ornitológica.'}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

    </section>
  );
}
