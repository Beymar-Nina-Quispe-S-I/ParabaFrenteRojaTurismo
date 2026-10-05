import React, { useState, useEffect } from 'react';
import FichaDetalle from './FichaDetalle';
import ListaAves from './ListaAves';
import RutasAvistamientoAve from './RutasAvistamientoAve';
import { obtenerAves } from '../services/avesService';
import '../styles/fichaTecnica.css';

export default function ModuloFichaTecnica({ onAveSeleccionadaExternamente }) {
  const [aves, setAves] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [idSeleccionado, setIdSeleccionado] = useState('paraba-frente-roja');
  const [textoFiltro, setTextoFiltro] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await obtenerAves();
      setAves(data);
      setCargando(false);
    }
    cargar();
  }, []);

  const aveActual = aves.find(a => a.id === idSeleccionado) || aves[0];

  const handleSeleccionarAve = (id) => {
    setIdSeleccionado(id);
    if (onAveSeleccionadaExternamente) {
      onAveSeleccionadaExternamente(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImprimir = () => {
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="coordinates-view">
      <div className="coordinates-shell">

        {/* Encabezado del Módulo */}
        <header className="coordinates-header">
          <div>
            <span className="coordinates-kicker">FICHA TÉCNICA DE AVES</span>
            <h2>Paraba de Frente Roja</h2>
            <p>Especies de aves de Omereque y la cuenca del Río Mizque (Cochabamba).</p>
          </div>

          <div>
            <button 
              className="coordinates-new-button" 
              type="button" 
              onClick={handleImprimir}
              title="Imprimir o exportar ficha a PDF"
            >
              🖨️ Imprimir ficha
            </button>
          </div>
        </header>

        {/* Cuadrícula de 2 paneles */}
        <div className="coordinates-grid">

          {/* Panel Izquierdo: Ficha Técnica Detallada */}
          <section className="coordinates-form-panel">
            {cargando ? (
              <p className="coordinates-empty">Cargando datos ornitológicos...</p>
            ) : (
              <FichaDetalle ave={aveActual} />
            )}
          </section>

          {/* Panel Derecho: Catálogo Lateral de Aves */}
          <ListaAves 
            aves={aves}
            idSeleccionado={idSeleccionado}
            textoFiltro={textoFiltro}
            onCambiarFiltro={setTextoFiltro}
            onSeleccionarAve={handleSeleccionarAve}
          />

        </div>

        {/* Sección de Rutas del Mapa de Omereque vinculadas con las aves */}
        <RutasAvistamientoAve onSeleccionarAvePorId={handleSeleccionarAve} />

      </div>
    </div>
  );
}
