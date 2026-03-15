import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchShipImages } from '../services/ShipImageService.js';

const ShipImagesContext = createContext(null);

/**
 * Hook pour accéder au mapping nom_vaisseau → url_image RSI.
 * Retourne null pendant le chargement initial, puis un objet (éventuellement vide).
 */
export function useShipImages() {
  return useContext(ShipImagesContext);
}

/**
 * Provider qui charge les images RSI au démarrage.
 * Initialisation synchrone depuis le cache localStorage si disponible.
 */
export function ShipImagesProvider({ children }) {
  const [images, setImages] = useState(() => {
    // Chargement synchrone depuis le cache v2 pour éviter le flash de chargement
    try {
      const raw = localStorage.getItem('sc_ship_images_v2');
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < 7 * 24 * 60 * 60 * 1000) return data;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    // Si le cache était déjà valide, pas besoin de refetch
    if (images !== null) return;
    fetchShipImages().then(data => setImages(data));
  }, []);

  return (
    <ShipImagesContext.Provider value={images}>
      {children}
    </ShipImagesContext.Provider>
  );
}
