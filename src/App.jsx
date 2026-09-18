import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
         <div class="spinner-overlay" id="spinnerOverlay"><div class="spinner-big"></div></div>
  <div class="toast" id="toast"></div>

  {/* <!-- Profile Drawer --> */}
  <div class="profile-drawer-overlay" id="profileDrawerOverlay" onclick="closeProfileDrawer()"></div>
  <div class="profile-drawer" id="profileDrawer">
    <button class="profile-drawer-close" onclick="closeProfileDrawer()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <div class="profile-drawer-header" id="profileDrawerHeader"></div>
    <div class="profile-drawer-body" id="profileDrawerBody"></div>
  </div>

  {/* <!-- Modal --> */}
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal" id="modalContent"></div>
  </div>
  <div id="mobileApp">

    {/* <!-- Vista Inicio --> */}
    <div class="mobile-view active" id="mViewInicio">
      <div class="carousel-container" id="carouselContainer">
        <div class="carousel-slides" id="carouselSlides">
          <div class="carousel-slide" style="background-image: url('https://cdn.sanity.io/images/71jmx9y3/production/f535cedc31a2607ca5d44499f2f8c9a4c865d79a-2260x3243.jpg?auto=format&fit=max&q=75&rect=0,0,2260,1306&w=1130')">
            <div class="carousel-content">
              <div class="eyebrow">Ara rubrogenys</div>
              <h2>Paraba Roja</h2>
              <p>Especie endémica de Bolivia, en peligro crítico de extinción</p>
              <button class="btn-explore" onclick="mobileNavigate('mViewMapa')">Explorar hábitat</button>
            </div>
          </div>
          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop')">
            <div class="carousel-content">
              <div class="eyebrow">Conservación</div>
              <h2>Valles secos</h2>
              <p>Ayúdanos a proteger su hábitat natural registrando lo que observas</p>
              <button class="btn-explore" onclick="mobileNavigate('mViewAvistamientos')">Ver avistamientos</button>
            </div>
          </div>
          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop')">
            <div class="carousel-content">
              <div class="eyebrow">Comunidad</div>
              <h2>Red de observadores</h2>
              <p>Únete a la red que protege y documenta a la paraba roja</p>
              <button class="btn-explore" onclick="openProfileDrawer()">Mi perfil</button>
            </div>
          </div>
        </div>
        <div class="carousel-dots" id="carouselDots"></div>
      </div>

      <div class="mobile-header" id="homeHeader">
        <div class="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
          <span>Ecos de Vuelo Rojo</span>
        </div>
        <button class="mobile-header-btn" onclick="openProfileDrawer()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>
      </div>

      <div class="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18m0 0l-4-4m4 4l4-4M3 12h18"/></svg>
          Clima actual
        </h3>
        <div class="mobile-weather">
          <div class="mobile-weather-icon" id="mWeatherIcon">☀️</div>
          <div class="mobile-weather-info">
            <div class="mobile-weather-temp" id="mTemp">--°C</div>
            <div class="mobile-weather-desc" id="mDesc">Obteniendo ubicación...</div>
          </div>
        </div>
      </div>

      <div class="quick-route-card" onclick="mobileNavigate('mViewRutas')">
        <div class="qr-text">
          <h4>Rutas hacia hábitats</h4>
          <p>Traza el camino a un punto de avistamiento</p>
        </div>
        <button aria-label="Ver rutas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div class="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          Alertas ambientales
        </h3>
        <div id="mAlertasContainer">
          <div class="skeleton-item"><div class="skeleton w60"></div><div class="skeleton w80"></div></div>
        </div>
      </div>
    </div>

    {/* <!-- Vista Mapa --> */}
    <div class="mobile-view" id="mViewMapa">
      <div class="mobile-map-container">
        <div class="mobile-map" id="mMap"></div>
      </div>

      <div class="mobile-header map-header" style="position: fixed; z-index: 100;">
        <div class="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <span id="mapHeaderLabel">Mapa</span>
        </div>
      </div>

      <div class="route-info-card" id="routeInfoCard">
        <div class="route-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <div class="route-info-body">
          <strong id="routeInfoName">—</strong>
          <span id="routeInfoMeta">—</span>
        </div>
        <button class="route-info-close" onclick="cerrarRuta()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="map-controls">
        <button class="map-control-btn primary" id="mBtnUbicacion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Mi ubicación
        </button>
        <button class="map-control-btn secondary" id="mBtnAvistamientos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m11-5v3a2 2 0 01-2 2h-3"/>
          </svg>
          Ver puntos
        </button>
      </div>
    </div>

    {/* <!-- Vista Avistamientos --> */}
    <div class="mobile-view" id="mViewAvistamientos">
      <div class="mobile-header scrolled" style="position: fixed;">
        <div class="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7"/></svg>
          <span>Avistamientos</span>
        </div>
      </div>
      <div style="height: calc(56px + var(--safe-top));"></div>
      <div class="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M9 20v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM22 8a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Comunidad
        </h3>
        <div id="mAvistamientosList">
          <div class="skeleton-item"><div class="skeleton w40"></div><div class="skeleton w60"></div></div>
          <div class="skeleton-item"><div class="skeleton w40"></div><div class="skeleton w60"></div></div>
          <div class="skeleton-item"><div class="skeleton w40"></div><div class="skeleton w60"></div></div>
        </div>
        <button class="mobile-btn mobile-btn-primary" style="margin-top:16px;" onclick="abrirModalRegistrarAvistamiento()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Registrar avistamiento
        </button>
      </div>
    </div>

    {/* <!-- Vista Rutas (NUEVA) --> */}
    <div class="mobile-view" id="mViewRutas">
      <div class="mobile-header scrolled" style="position: fixed;">
        <div class="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/>
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6"/>
          </svg>
          <span>Rutas</span>
        </div>
      </div>
      <div style="height: calc(56px + var(--safe-top));"></div>
      <div class="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/>
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6"/>
          </svg>
          Puntos de avistamiento
        </h3>
        <div class="ruta-filter-note" id="rutaGeoNote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span>Activa tu ubicación para ver la distancia a cada punto</span>
        </div>
        <div id="mRutasList">
          <div class="skeleton-item"><div class="skeleton w60"></div><div class="skeleton w40"></div></div>
          <div class="skeleton-item"><div class="skeleton w60"></div><div class="skeleton w40"></div></div>
        </div>
      </div>
    </div>

    {/* <!-- Bottom Navigation: 4 secciones --> */}
    <div class="mobile-bottom-nav">
      <button class="mobile-nav-item active" onclick="mobileNavigate('mViewInicio')" id="mNavInicio">
        <span class="nav-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg></span>
        <span>Inicio</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileNavigate('mViewMapa')" id="mNavMapa">
        <span class="nav-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg></span>
        <span>Mapa</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileNavigate('mViewAvistamientos')" id="mNavAvistamientos">
        <span class="nav-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7"/></svg></span>
        <span>Avistamientos</span>
      </button>
      <button class="mobile-nav-item" onclick="mobileNavigate('mViewRutas')" id="mNavRutas">
        <span class="nav-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/>
          <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6"/>
        </svg></span>
        <span>Rutas</span>
      </button>
    </div>
  </div>
    </>
  )
}

export default App
