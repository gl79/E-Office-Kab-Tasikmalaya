import { MapPin } from 'lucide-react';
import { generateMapsQuery } from '@/utils/maps';

interface MapPreviewProps {
    lokasi?: string | null;
}

/**
 * Google Maps Preview Component
 *
 * Displays Google Maps embed iframe with a link to open in new tab.
 *
 * @param lokasi - Location text for the Google Maps search query
 */
const MapPreview = ({ lokasi }: MapPreviewProps) => {
    const maps = generateMapsQuery(lokasi);

    if (!maps) {
        return null;
    }

    return (
        <div className="mt-3 space-y-2">
            <iframe
                src={maps.embed}
                className="w-full h-52 rounded-xl border border-border-default"
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Preview"
            />

            <a
                href={maps.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
                <MapPin className="h-3.5 w-3.5" />
                Buka di Google Maps
            </a>
        </div>
    );
};

export default MapPreview;
