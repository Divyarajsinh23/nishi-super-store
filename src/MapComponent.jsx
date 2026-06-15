import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

// 1. Fix Leaflet's default marker icon issue in React (Vite environment)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// 2. Constants for Shop Location
const SHOP_LAT = 22.05267367025643;
const SHOP_LNG = 73.11629976011308;
const SHOP_NAME = "Nishi Super Store";
const SHOP_ADDRESS = "Nava Bazar, Karjan, Gujarat 391240";
const SHOP_POSITION = [SHOP_LAT, SHOP_LNG];

// Google Maps links
const GOOGLE_MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${SHOP_LAT},${SHOP_LNG}`;
const GOOGLE_MAPS_DIR_URL = "https://maps.app.goo.gl/jo3b9JLMkTWck3sN9";

// 3. Custom Marker Icon with Pulse and Glow Animations (via CSS)
const customShopIcon = L.divIcon({
  className: "custom-shop-marker",
  html: `
    <div class="custom-marker-wrapper">
      <div class="marker-glow"></div>
      <div class="marker-pulse"></div>
      <div class="marker-pin-container">
        <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" class="w-8 h-8 object-contain" alt="Shop Marker" />
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -16]
});

const MapComponent = () => {
  const markerRef = useRef(null);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Monitor scroll height to show floating action button (FAB) after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingBtn(true);
      } else {
        setShowFloatingBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hover logic: open popup on mouse over, close after a delay on mouse leave
  const handleMouseOver = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  };

  const handleMouseOut = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.closePopup();
      }
    }, 1500); // 1.5s grace period to allow interaction inside the popup
  };

  // Keep popup open if mouse enters the popup container itself
  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    handleMouseOut();
  };

  const openGoogleMaps = () => {
    window.open(GOOGLE_MAPS_SEARCH_URL, "_blank", "noopener,noreferrer");
  };

  const openDirections = (e) => {
    e.stopPropagation();
    window.open(GOOGLE_MAPS_DIR_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="map-section py-8 px-2 max-w-7xl mx-auto w-full text-left" id="shop-location-section">
      <div className="flex items-center gap-3.5 mb-6 pl-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Our Shop Location</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Visit us for premium grocery items and fresh products.</p>
        </div>
      </div>

      <div className="map-wrapper relative">
        <MapContainer
          center={SHOP_POSITION}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={true}
          className="map-container"
        >
          {/* Tile Layer: OpenStreetMap Standard */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Zoom Control at Bottom-Left */}
          <ZoomControl position="bottomleft" />

          {/* Shop Custom Pin Marker */}
          <Marker
            position={SHOP_POSITION}
            icon={customShopIcon}
            ref={markerRef}
            eventHandlers={{
              mouseover: handleMouseOver,
              mouseout: handleMouseOut,
              click: openGoogleMaps,
            }}
          >
            <Popup autoClose={false} closeOnClick={false}>
              <div
                className="p-1 space-y-3 max-w-[260px] text-left"
                onMouseEnter={handlePopupMouseEnter}
                onMouseLeave={handlePopupMouseLeave}
              >
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  </div>
                  <h4 className="font-extrabold text-sm text-white leading-tight">{SHOP_NAME}</h4>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Address</p>
                  <p className="text-[11.5px] text-zinc-300 font-medium leading-relaxed">{SHOP_ADDRESS}</p>
                </div>

                <button
                  onClick={openDirections}
                  className="w-full mt-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-bold tracking-wider uppercase rounded-xl transition-all duration-200 shadow-md shadow-emerald-900/35 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  <span>Get Direction</span>
                </button>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating "Get Direction" Button (appears after scroll) */}
        {showFloatingBtn && (
          <button
            onClick={openDirections}
            className="floating-directions-btn"
            title="Get navigation direction in Google Maps"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <span>Get Direction</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default MapComponent;
