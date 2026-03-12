/**
 * Google Maps URL Generator
 *
 * Generates Google Maps URLs for search and embed based on location text.
 * Does NOT use Google Maps API (paid). Uses free embed via query parameter.
 */

interface MapsResult {
    query: string;
    url: string;
    embed: string;
}

/**
 * Generate Google Maps query, URL, and embed URL from a location string.
 *
 * @param lokasi - Location text (e.g. "Pasirhuni, Kec. Singaparna, Kab. Tasikmalaya, Jawa Barat")
 * @returns Object with query, url, embed — or null if lokasi is empty
 */
export function generateMapsQuery(lokasi?: string | null): MapsResult | null {
    if (!lokasi?.trim()) {
        return null;
    }

    const query = lokasi.trim();
    const encoded = encodeURIComponent(query);

    return {
        query,
        url: `https://www.google.com/maps?q=${encoded}`,
        embed: `https://www.google.com/maps?q=${encoded}&output=embed`,
    };
}
