/* ==========================================================================
   FICHA TÉCNICA DE AVES - JavaScript
   Especie principal: Paraba de Frente Roja (Ara rubrogenys)
   Código nativo, limpio y fácil de explicar
   ========================================================================== */

(function () {
  'use strict';

  // 1. Base de datos inicial de aves de Omereque y Río Mizque
  const avesIniciales = [
    {
      id: 'paraba-frente-roja',
      nombreComun: 'Paraba de Frente Roja',
      nombreCientifico: 'Ara rubrogenys',
      familia: 'Psittacidae',
      orden: 'Psittaciformes',
      estado: 'CR',
      estadoTexto: 'En Peligro Crítico',
      tamano: '55 a 60 cm',
      sector: 'Rutas 1, 2 y 3 (Río Mizque y Reserva)',
      rutas: 'Ruta 1, Ruta 2 y Ruta 3',
      puntosMapa: 'Baja al río en Ruta 1 (P0 a P5); sobrevuela los acantilados en Ruta 2 (P6 a P8); y duerme en la colonia de Ruta 3 (Reserva 19 km). Anidación registrada en Nido 1, Nido 2 y Nido 3 cerca de los hides.',
      color: '#d32f2f',
      imagen: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=700&q=80',
      descripcion: 'Plumaje general verde oliva con frente, corona y hombros de color rojo escarlata vivo. Plumas de vuelo y cola con tonos azul turquesa. Pico negro y robusto.',
      habitat: 'Valles secos interandinos con acantilados de arenisca, matorrales espinosos y cañones fluviales entre 1,100 y 2,700 msnm.',
      alimentacion: 'Semillas duras del árbol Soto (Schinopsis haenkeana), frutos de cactus columnares, semillas de jarka y algarrobo. Ocasionalmente maíz y maní.',
      reproduccion: 'Nidifica en oquedades naturales de farallones rocosos verticales a orillas del Río Mizque. Temporada de cría: Septiembre a Marzo.',
      conservacion: 'Especie 100% endémica de Bolivia en Peligro Crítico (CR). Se estima menos de 1,000 individuos. Protegida con proyectos de ecoturismo comunitario en Omereque.'
    },
    {
      id: 'cotorra-valles',
      nombreComun: 'Cotorra de los Valles',
      nombreCientifico: 'Myiopsitta luchsi',
      familia: 'Psittacidae',
      orden: 'Psittaciformes',
      estado: 'LC',
      estadoTexto: 'Preocupación Menor',
      tamano: '28 a 30 cm',
      sector: 'Ruta 1 (Ribereño) y Ruta 2 (Miradores)',
      rutas: 'Ruta 1 y Ruta 2',
      puntosMapa: 'Vuelos rasantes por la orilla del río (P2 a P5) y colonias comunales en las grietas altas de los acantilados de Ruta 2 (camino a Peña Colorada).',
      color: '#24513d',
      imagen: 'https://images.unsplash.com/photo-1544943910-4c1dc44a05e2?auto=format&fit=crop&w=700&q=80',
      descripcion: 'Cuerpo verde claro con frente y pecho grisáceo limpio. Vientre amarillento y plumas remeras azul cobalto.',
      habitat: 'Laderas secas y paredones rocosos donde construye nidos comunales de ramitas.',
      alimentacion: 'Semillas de cactus, frutos silvestres y brotes de arbustos nativos.',
      reproduccion: 'Anida en grietas de los mismos acantilados que la Paraba de Frente Roja.',
      conservacion: 'Endémica de los valles secos de Bolivia. Poblaciones estables pero vulnerables al desmonte.'
    },
    {
      id: 'picaflor-cometa',
      nombreComun: 'Picaflor Cometa',
      nombreCientifico: 'Sappho sparganurus',
      familia: 'Trochilidae',
      orden: 'Apodiformes',
      estado: 'LC',
      estadoTexto: 'Preocupación Menor',
      tamano: '19 a 22 cm',
      sector: 'Ruta 3 y Quebrada El Arenal',
      rutas: 'Ruta 3 y Quebrada El Arenal',
      puntosMapa: 'Abundante en arbustos con flores y cactus al cruzar la Quebrada El Arenal y en huertos familiares saliendo de Omereque (P0).',
      color: '#e65100',
      imagen: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=700&q=80',
      descripcion: 'Macho con cola larga, bifurcada y de brillo rojizo dorado resplandeciente. Garganta verde esmeralda.',
      habitat: 'Quebradas y laderas con arbustos floridos y cactus.',
      alimentacion: 'Néctar de flores tubulares de cactus y pequeños insectos en vuelo.',
      reproduccion: 'Construye un pequeño nido cónico bajo cornisas protegidas de piedra.',
      conservacion: 'Muy común en los alrededores de Omereque durante las primeras horas del día.'
    },
    {
      id: 'carpintero-cardones',
      nombreComun: 'Carpintero de los Cardones',
      nombreCientifico: 'Melanerpes cactorum',
      familia: 'Picidae',
      orden: 'Piciformes',
      estado: 'LC',
      estadoTexto: 'Preocupación Menor',
      tamano: '16 a 18 cm',
      sector: 'Ruta 1 (Sendero ribereño)',
      rutas: 'Ruta 1',
      puntosMapa: 'Forrajea activamente en troncos de Soto y cardonales viejos entre las paradas P2, P3 y P4 junto al Río Mizque.',
      color: '#f57f17',
      imagen: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?auto=format&fit=crop&w=700&q=80',
      descripcion: 'Frente blanca, nuca negra y parche amarillo en la garganta. Espalda rayada en blanco y negro.',
      habitat: 'Bosques chaqueños y sotales con cactus columnares viejos.',
      alimentacion: 'Larvas de madera, insectos y frutos carnosos de cactus.',
      reproduccion: 'Perfora huecos en troncos secos o cactus columnares para anidar.',
      conservacion: 'Especie clave: sus cavidades son reutilizadas por otras aves pequeñas.'
    },
    {
      id: 'halcon-peregrino',
      nombreComun: 'Halcón Peregrino',
      nombreCientifico: 'Falco peregrinus',
      familia: 'Falconidae',
      orden: 'Falconiformes',
      estado: 'LC',
      estadoTexto: 'Preocupación Menor',
      tamano: '38 a 48 cm',
      sector: 'Ruta 2 (Miradores altos)',
      rutas: 'Ruta 2',
      puntosMapa: 'Apostado en los riscos escarpados de las paradas altas P6, P7 y P8 con vista panorámica a los farallones del cañón.',
      color: '#37474f',
      imagen: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=700&q=80',
      descripcion: 'Dorso gris oscuro, cabeza con capucha negra y pecho barreado de negro.',
      habitat: 'Acantilados altos y cañones con amplia visibilidad hacia el río.',
      alimentacion: 'Caza aves en picada aérea veloz.',
      reproduccion: 'Usa repisas rocosas en los paredones más inaccesibles del cañón.',
      conservacion: 'Especie protegida, indicadora de la buena salud del ecosistema del cañón.'
    }
  ];

  // 2. Variables de estado
  let aves = [];
  let idAveActual = 'paraba-frente-roja';
  let idEditando = null;
  let textoFiltro = '';
  const CLAVE_LOCAL = 'fichas_aves_omereque_datos';

  // Utilidad simple para evitar problemas con comillas y signos
  function escapar(texto) {
    return String(texto ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 3. Cargar y guardar en LocalStorage
  function cargarAves() {
    const guardado = localStorage.getItem(CLAVE_LOCAL);
    if (guardado) {
      try {
        aves = JSON.parse(guardado);
        // Si las aves guardadas no tienen el campo rutas, actualizamos con las iniciales
        if (!aves.length || !aves[0].rutas) {
          aves = [...avesIniciales];
          guardarEnLocal();
        }
      } catch (e) {
        aves = [...avesIniciales];
      }
    } else {
      aves = [...avesIniciales];
      guardarEnLocal();
    }
  }

  function guardarEnLocal() {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(aves));
  }

  // 4. Mostrar la Ficha Técnica del ave activa (Panel Izquierdo)
  function mostrarFicha() {
    const contenedor = document.getElementById('contenidoFicha');
    const titulo = document.getElementById('detalleTitulo');
    const ave = aves.find(a => a.id === idAveActual) || aves[0];

    if (!ave) {
      contenedor.innerHTML = '<p class="coordinates-empty">No hay ave seleccionada.</p>';
      return;
    }

    titulo.textContent = ave.nombreComun;
    const claseBadge = 'badge-' + (ave.estado || 'lc').toLowerCase();

    contenedor.innerHTML = `
      <div class="ficha-detalle-box">
        <div class="ficha-foto-tabla-grid">
          <div class="ficha-foto-caja">
            <img src="${escapar(ave.imagen || 'mapa_avistamiento_omereque.png')}" 
                 alt="${escapar(ave.nombreComun)}" 
                 onerror="this.onerror=null;this.src='mapa_avistamiento_omereque.png';">
          </div>
          <table class="tabla-datos">
            <tbody>
              <tr><th>Científico:</th><td><em>${escapar(ave.nombreCientifico)}</em></td></tr>
              <tr><th>Familia:</th><td>${escapar(ave.familia)}</td></tr>
              <tr><th>Estado:</th><td><span class="badge-estado ${claseBadge}">${escapar(ave.estado)} &middot; ${escapar(ave.estadoTexto || ave.estado)}</span></td></tr>
              <tr><th>Tamaño:</th><td>${escapar(ave.tamano || 'No registrado')}</td></tr>
              <tr><th>Sector:</th><td><strong>${escapar(ave.sector || 'Omereque')}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="ficha-secciones-grid">
          <div class="ficha-seccion-item" style="border-left: 4px solid #24513d; background: #edf5ed;">
            <h4 style="color: #24513d;">¿Por qué rutas anda según el mapa?</h4>
            <p><strong>${escapar(ave.rutas || ave.sector || 'Omereque')}</strong> &middot; ${escapar(ave.puntosMapa || 'Avistada en los cañones y orillas de Omereque.')}</p>
          </div>

          <div class="ficha-seccion-item">
            <h4>Descripción física y plumaje</h4>
            <p>${escapar(ave.descripcion || 'Sin descripción.')}</p>
          </div>

          <div class="ficha-seccion-item">
            <h4>Hábitat y distribución</h4>
            <p>${escapar(ave.habitat || 'Sin datos de hábitat.')}</p>
          </div>

          <div class="ficha-seccion-item">
            <h4>Alimentación</h4>
            <p>${escapar(ave.alimentacion || 'Sin datos de alimentación.')}</p>
          </div>

          <div class="ficha-seccion-item">
            <h4>Reproducción y anidación</h4>
            <p>${escapar(ave.reproduccion || 'Sin datos de reproducción.')}</p>
          </div>

          <div class="ficha-seccion-item ficha-destacada">
            <h4>Estado de conservación y amenazas</h4>
            <p>${escapar(ave.conservacion || 'Sin información de conservación.')}</p>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Mostrar la Lista de Tarjetas de Aves (Panel Derecho)
  function renderListaAves() {
    const lista = document.getElementById('listaAves');
    const filtradas = aves.filter(ave => {
      if (!textoFiltro) return true;
      return ave.nombreComun.toLowerCase().includes(textoFiltro) ||
             ave.nombreCientifico.toLowerCase().includes(textoFiltro) ||
             ave.familia.toLowerCase().includes(textoFiltro) ||
             (ave.rutas && ave.rutas.toLowerCase().includes(textoFiltro));
    });

    if (filtradas.length === 0) {
      lista.innerHTML = '<p class="coordinates-empty">No se encontraron aves con ese nombre.</p>';
      return;
    }

    lista.innerHTML = filtradas.map(ave => {
      const seleccionada = ave.id === idAveActual ? 'is-selected' : '';
      const colorBorde = ave.color || '#24513d';
      const claseBadge = 'badge-' + (ave.estado || 'lc').toLowerCase();

      return `
        <article class="coordinates-route-card ${seleccionada}" data-id="${escapar(ave.id)}">
          <div class="coordinates-route-color" style="background:${escapar(colorBorde)}"></div>
          <div class="coordinates-route-card-content">
            <div class="coordinates-route-card-top">
              <h4>${escapar(ave.nombreComun)}</h4>
              <span class="badge-estado ${claseBadge}">${escapar(ave.estado)}</span>
            </div>
            <small class="subtitulo-cientifico">${escapar(ave.nombreCientifico)}</small>
            <p>${escapar(ave.descripcion ? ave.descripcion.substring(0, 90) + '...' : '')}</p>
            <small class="meta-info"><strong>Rutas:</strong> ${escapar(ave.rutas || ave.sector || 'Omereque')}</small>
            <div class="coordinates-card-actions">
              <button type="button" data-accion="ver" data-id="${escapar(ave.id)}">Ver</button>
              <button type="button" data-accion="editar" data-id="${escapar(ave.id)}">Editar</button>
              <button type="button" class="danger" data-accion="eliminar" data-id="${escapar(ave.id)}">Eliminar</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // 6. Alternar entre Modo Detalle y Modo Formulario
  function verModoDetalle() {
    document.getElementById('vistaDetalle').hidden = false;
    document.getElementById('vistaFormulario').hidden = true;
    idEditando = null;
    mostrarFicha();
  }

  function verModoFormulario(idParaEditar = null) {
    document.getElementById('vistaDetalle').hidden = true;
    document.getElementById('vistaFormulario').hidden = false;
    const form = document.getElementById('formularioAve');
    const titulo = document.getElementById('formTitulo');
    const mensaje = document.getElementById('mensajeForm');
    mensaje.textContent = '';
    form.reset();

    idEditando = idParaEditar;

    if (idParaEditar) {
      const ave = aves.find(a => a.id === idParaEditar);
      if (!ave) return;

      titulo.textContent = 'Editar ave: ' + ave.nombreComun;
      document.getElementById('campoNombreComun').value = ave.nombreComun || '';
      document.getElementById('campoNombreCientifico').value = ave.nombreCientifico || '';
      document.getElementById('campoFamilia').value = ave.familia || '';
      document.getElementById('campoEstado').value = ave.estado || 'LC';
      document.getElementById('campoTamano').value = ave.tamano || '';
      document.getElementById('campoSector').value = ave.sector || '';
      document.getElementById('campoImagen').value = ave.imagen || '';
      document.getElementById('campoDescripcion').value = ave.descripcion || '';
      document.getElementById('campoHabitat').value = ave.habitat || '';
      document.getElementById('campoAlimentacion').value = ave.alimentacion || '';
      document.getElementById('campoReproduccion').value = ave.reproduccion || '';
      document.getElementById('campoConservacion').value = ave.conservacion || '';
    } else {
      titulo.textContent = 'Nueva ave';
    }

    document.getElementById('campoNombreComun').focus();
  }

  // 7. Guardar Formulario
  function guardarFormulario(event) {
    event.preventDefault();
    const mensaje = document.getElementById('mensajeForm');

    const nombreComun = document.getElementById('campoNombreComun').value.trim();
    const nombreCientifico = document.getElementById('campoNombreCientifico').value.trim();
    const selectEstado = document.getElementById('campoEstado');
    const estado = selectEstado.value;
    const estadoTexto = selectEstado.options[selectEstado.selectedIndex].text.replace(/^[A-Z]+\s*-\s*/, '');

    // Asignar color según estado para la barra lateral
    let colorBarra = '#24513d';
    if (estado === 'CR') colorBarra = '#d32f2f';
    else if (estado === 'EN') colorBarra = '#e65100';
    else if (estado === 'VU') colorBarra = '#f57f17';

    const datosAve = {
      id: idEditando || ('ave-' + Date.now()),
      nombreComun: nombreComun,
      nombreCientifico: nombreCientifico,
      familia: document.getElementById('campoFamilia').value.trim(),
      orden: 'Psittaciformes',
      estado: estado,
      estadoTexto: estadoTexto,
      tamano: document.getElementById('campoTamano').value.trim(),
      sector: document.getElementById('campoSector').value.trim() || 'Omereque',
      color: colorBarra,
      imagen: document.getElementById('campoImagen').value.trim(),
      descripcion: document.getElementById('campoDescripcion').value.trim(),
      habitat: document.getElementById('campoHabitat').value.trim(),
      alimentacion: document.getElementById('campoAlimentacion').value.trim(),
      reproduccion: document.getElementById('campoReproduccion').value.trim(),
      conservacion: document.getElementById('campoConservacion').value.trim()
    };

    if (idEditando) {
      const idx = aves.findIndex(a => a.id === idEditando);
      if (idx !== -1) aves[idx] = datosAve;
    } else {
      aves.unshift(datosAve);
    }

    idAveActual = datosAve.id;
    guardarEnLocal();

    mensaje.textContent = 'Ave guardada correctamente.';
    mensaje.className = 'coordinates-message is-success';

    setTimeout(() => {
      verModoDetalle();
      renderListaAves();
    }, 400);
  }

  // 8. Eliminar Ave
  function eliminarAve(id) {
    if (aves.length <= 1) {
      alert('Debe quedar al menos una ficha técnica en la lista.');
      return;
    }

    const ave = aves.find(a => a.id === id);
    const nombre = ave ? ave.nombreComun : 'esta ave';

    if (confirm('¿Se eliminará la ficha de "' + nombre + '"?')) {
      aves = aves.filter(a => a.id !== id);
      if (idAveActual === id) {
        idAveActual = aves[0].id;
      }
      guardarEnLocal();
      mostrarFicha();
      renderListaAves();
    }
  }

  // 9. Restablecer datos originales
  function restablecerOriginales() {
    if (confirm('¿Deseas restablecer la lista original de aves de Omereque?')) {
      aves = [...avesIniciales];
      idAveActual = 'paraba-frente-roja';
      guardarEnLocal();
      verModoDetalle();
      renderListaAves();
    }
  }

  // 10. Asociar Eventos
  function bindEvents() {
    // Botón Nueva Ave (Encabezado)
    document.getElementById('btnNuevaAve').addEventListener('click', () => verModoFormulario());

    // Botón Editar Ficha (Panel Izquierdo)
    document.getElementById('btnEditarActual').addEventListener('click', () => verModoFormulario(idAveActual));

    // Botón Cancelar Formulario
    document.getElementById('btnCancelarForm').addEventListener('click', verModoDetalle);

    // Botón Imprimir
    document.getElementById('btnImprimir').addEventListener('click', () => {
      verModoDetalle();
      setTimeout(() => window.print(), 100);
    });

    // Botón Restablecer
    document.getElementById('btnRestaurar').addEventListener('click', restablecerOriginales);

    // Guardar Formulario
    document.getElementById('formularioAve').addEventListener('submit', guardarFormulario);

    // Buscador
    document.getElementById('buscador').addEventListener('input', e => {
      textoFiltro = e.target.value.toLowerCase().trim();
      renderListaAves();
    });

    // Clics en la lista de tarjetas (delegación de eventos)
    document.getElementById('listaAves').addEventListener('click', event => {
      const boton = event.target.closest('button[data-accion]');
      const tarjeta = event.target.closest('.coordinates-route-card');

      if (boton) {
        event.stopPropagation();
        const accion = boton.dataset.accion;
        const id = boton.dataset.id;

        if (accion === 'ver') {
          idAveActual = id;
          verModoDetalle();
          renderListaAves();
        } else if (accion === 'editar') {
          idAveActual = id;
          verModoFormulario(id);
        } else if (accion === 'eliminar') {
          eliminarAve(id);
        }
        return;
      }

      if (tarjeta) {
        idAveActual = tarjeta.dataset.id;
        verModoDetalle();
        renderListaAves();
      }
    });
  }

  // 11. Inicializar
  function init() {
    cargarAves();
    bindEvents();
    verModoDetalle();
    renderListaAves();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
