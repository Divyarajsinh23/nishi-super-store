import React from "react";
import "./StoreMap.css";

// ─── EXACT iframe embed from Google Maps "Share → Embed a map" for Nishi Super Store ───
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d231.1202218805351!2d73.11590301707699!3d22.052519751766233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395feb7520b25f01%3A0xcb39b8b1e7b4e700!2sNishi%20super%20store!5e0!3m2!1sen!2sin!4v1781593443898!5m2!1sen!2sin";

// Directions link — opens Google Maps navigation to the store
const GOOGLE_MAPS_DIR_URL =
  "https://www.google.com/maps/dir/?api=1&destination_place_id=ChIJAV8iy1Xr3TsR-OC0aMexucs&destination=Nishi+super+store,+Karjan";

const SHOP_NAME = "Nishi Super Store";
const SHOP_ADDRESS = "Nava Bazar, Karjan, Gujarat 391240";

export default function StoreMap({ storeLocation }) {
  const openDirections = (e) => {
    e.stopPropagation();
    window.open(GOOGLE_MAPS_DIR_URL, "_blank", "noopener,noreferrer");
  };

  const address = storeLocation?.address || SHOP_ADDRESS;

  return (
    <section className="map-section py-8 px-2 max-w-7xl mx-auto w-full text-left" id="shop-location-section">
      {/* Section Header */}
      <div className="flex items-center gap-3.5 mb-6 pl-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Our Shop Location</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Visit us for premium grocery items and fresh products.</p>
        </div>
      </div>

      {/* Map Wrapper */}
      <div className="map-wrapper relative">
        {/* ✅ Exact Google Maps embed — shows the real Nishi Super Store pin */}
        <iframe
          src={GOOGLE_MAPS_EMBED_URL}
          className="map-container"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Nishi Super Store Location"
        />

        {/* Floating "Get Direction" Button */}
        <button
          onClick={openDirections}
          className="floating-directions-btn"
          title="Get directions to Nishi Super Store"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>Get Direction</span>
        </button>
      </div>

      {/* Shop Info Card */}
      <div className="map-info-card">
        <div className="map-info-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="map-info-text">
          <p className="map-info-name">{SHOP_NAME}</p>
          <p className="map-info-address">{address}</p>
        </div>
        <button onClick={openDirections} className="map-info-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Directions
        </button>
      </div>
    </section>
  );
}
