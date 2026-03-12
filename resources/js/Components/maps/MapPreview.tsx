import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { generateMapsQuery } from '@/utils/maps';

interface MapPreviewProps {
    lokasi?: string | null;
}

/**
 * Google Maps Preview Component
 *
 * Displays a toggleable Google Maps embed iframe with a link to open in new tab.
 * Uses a toggle pattern for mobile performance: shows a placeholder button first,
 * then loads the iframe only when requested.
 *
 * @param lokasi - Location text for the Google Maps search query
 */
const MapPreview = ({ lokasi }: MapPreviewProps) => {
    const [showMap, setShowMap] = useState(false);
    const [hasError, setHasError] = useState(false);

    const maps = generateMapsQuery(lokasi);

    if (!maps) {
        return null;
    }

    return (
        <div className="mt-3 space-y-2">
            {!showMap ? (
                /* Placeholder — Tampilkan Peta button */
                <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="flex items-center gap-2 px-4 py-2.5 w-full justify-center rounded-xl border border-border-default bg-surface-hover text-sm font-medium text-primary hover:bg-primary-light transition-colors cursor-pointer"
                >
                    <MapPin className="h-4 w-4" />
                    Tampilkan Peta
                </button>
            ) : (
                /* Map iframe + Buka di Google Maps link */
                <div className="space-y-2">
                    {!hasError ? (
                        <iframe
                            src={maps.embed}
                            className="w-full h-52 rounded-xl border border-border-default"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps Preview"
                            onError={() => setHasError(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-52 rounded-xl border border-border-default bg-surface-hover">
                            <p className="text-sm text-text-secondary">
                                Peta tidak dapat dimuat
                            </p>
                        </div>
                    )}

                    <a
                        href={maps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        📍 Buka di Google Maps
                    </a>
                </div>
            )}
        </div>
    );
};

export default MapPreview;
