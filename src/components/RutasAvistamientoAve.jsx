import React from 'react';

export default function RutasAvistamientoAve({ onSeleccionarAvePorId }) {
  return (
    <section className="panel-mapa-rutas">
      <div className="coordinates-panel-title">
        <div>
          <span className="coordinates-kicker">AVISTAMIENTO POR RUTAS</span>
          <h3>¿Por qué rutas anda cada ave según el mapa de Omereque?</h3>
        </div>
      </div>

      {/* Imagen oficial del mapa de Omereque */}
      <div className="contenedor-imagen-mapa">
        <img 
          src="/mapa_avistamiento_omereque.png" 
          alt="Mapa oficial de avistamiento de la Paraba de Frente Roja en Omereque" 
        />
      </div>

      {/* Tarjetas de las 3 rutas con sus aves correspondientes */}
      <div className="rutas-resumen-grid">
        
        {/* RUTA 1 */}
        <div className="ruta-item" style={{ borderLeftColor: '#d9772b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4>Ruta 1 (P0 - P5) &middot; 9.16 km</h4>
            <span className="ruta-etiqueta" style={{ color: '#d9772b' }}>Sendero ribereño</span>
          </div>
          <p style={{ margin: '6px 0 10px', fontWeight: 600, color: '#20352b' }}>
            Recorrido plano por la orilla del Río Mizque:
          </p>
          <ul className="lista-aves-ruta">
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('paraba-frente-roja')}
              >
                Paraba de Frente Roja:
              </button> 
              Bajan a tomar agua a las playas del río por las mañanas y forrajean en árboles de Soto. Anidan en los paredones de <em>Nido 1, Nido 2 y Nido 3</em> cerca de los hides de camuflaje.
            </li>
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('carpintero-cardones')}
              >
                Carpintero de los Cardones:
              </button> 
              Activo en los troncos secos y cactus columnares de la orilla (P2 a P4).
            </li>
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('cotorra-valles')}
              >
                Cotorra de los Valles:
              </button> 
              Vuela en bandadas ruidosas a baja altura a lo largo de las riberas.
            </li>
          </ul>
        </div>

        {/* RUTA 2 */}
        <div className="ruta-item" style={{ borderLeftColor: '#24513d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4>Ruta 2 (P0 - P8) &middot; 9.26 km</h4>
            <span className="ruta-etiqueta" style={{ color: '#24513d' }}>Miradores y orillas</span>
          </div>
          <p style={{ margin: '6px 0 10px', fontWeight: 600, color: '#20352b' }}>
            Sube hacia miradores altos con vistas panorámicas al cañón y regresa al río:
          </p>
          <ul className="lista-aves-ruta">
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('halcon-peregrino')}
              >
                Halcón Peregrino:
              </button> 
              Se posa en los riscos más altos de los miradores (P6, P7 y P8) para vigilar y cazar en picada.
            </li>
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('paraba-frente-roja')}
              >
                Paraba de Frente Roja:
              </button> 
              Se observan volando en parejas o grupos familiares entre los acantilados altos y las orillas pedregosas (cerca de <em>Nido 1 y Nido 2</em>).
            </li>
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('cotorra-valles')}
              >
                Cotorra de los Valles:
              </button> 
              Colonias comunales en las grietas inaccesibles de los paredones de piedra.
            </li>
          </ul>
        </div>

        {/* RUTA 3 */}
        <div className="ruta-item" style={{ borderLeftColor: '#6a1b9a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4>Ruta 3 &middot; 19 km</h4>
            <span className="ruta-etiqueta" style={{ color: '#6a1b9a' }}>Reserva Paraba Frente Roja</span>
          </div>
          <p style={{ margin: '6px 0 10px', fontWeight: 600, color: '#20352b' }}>
            Camino desde Omereque pasando por quebradas hasta la reserva comunitaria:
          </p>
          <ul className="lista-aves-ruta">
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('paraba-frente-roja')}
              >
                Paraba de Frente Roja:
              </button> 
              Principal santuario protegido. Concentra los dormideros comunales y la mayor cantidad de parejas reproductoras.
            </li>
            <li>
              <button 
                type="button" 
                className="btn-enlace-ave"
                onClick={() => onSeleccionarAvePorId && onSeleccionarAvePorId('picaflor-cometa')}
              >
                Picaflor Cometa:
              </button> 
              Frecuente en los cardonales y arbustos con flores a lo largo de la <em>Quebrada El Arenal</em>.
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}
