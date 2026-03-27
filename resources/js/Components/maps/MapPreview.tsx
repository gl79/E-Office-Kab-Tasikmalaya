import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapPreviewProps {
    lokasi?: string | null;
    koordinat?: { lat: number | null; lng: number | null } | null;
}

const createCustomIcon = () => {
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #22c55e; width: 36px; height: 36px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                 <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

/**
 * Leaflet Map Preview Component
 *
 * Displays Leaflet interactive map showing schedule location pinpoint.
 * Requires React.useRef inside for unmounting correctly.
 */
const MapPreview = ({ lokasi, koordinat }: MapPreviewProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const hasValidCoords = koordinat && typeof koordinat.lat === 'number' && typeof koordinat.lng === 'number';

    useEffect(() => {
        if (!mapContainerRef.current || mapInstance.current || !hasValidCoords) return;

        // Initialize map
        const map = L.map(mapContainerRef.current).setView([koordinat.lat!, koordinat.lng!], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Add marker
        const icon = createCustomIcon();
        const marker = L.marker([koordinat.lat!, koordinat.lng!], { icon }).addTo(map);

        if (lokasi) {
            marker.bindPopup(`<div style="font-family: inherit; font-size: 12px; font-weight: 600;">${lokasi}</div>`);
        }

        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [koordinat, lokasi, hasValidCoords]);

    if (!hasValidCoords) {
        return (
            <div className="mt-3 bg-surface-hover rounded-xl border border-border-default p-4 flex flex-col items-center justify-center text-center">
                <MapPin className="h-6 w-6 text-text-tertiary mb-2" />
                <p className="text-sm text-text-secondary">Peta Interaktif tidak tersedia</p>
                <p className="text-xs text-text-tertiary mt-1">Sistem gagal mendeteksi koordinat wilayah pada jadwal ini.</p>
                {lokasi && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lokasi)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                    >
                        Cari "{lokasi}" manual di Google Maps
                    </a>
                )}
            </div>
        );
    }

    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${koordinat.lat},${koordinat.lng}`;

    return (
        <div className="mt-3 space-y-2">
            <div 
                ref={mapContainerRef} 
                className="w-full h-[250px] rounded-xl border border-border-default z-0 relative overflow-hidden"
                style={{ zIndex: 0 }}
            />
            <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                title="Buka rute navigasi dari Google Maps"
            >
                <MapPin className="h-3 w-3" />
                Buka navigasi di Google Maps
            </a>
        </div>
    );
};

export default MapPreview;
