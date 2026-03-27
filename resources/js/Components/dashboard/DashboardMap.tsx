import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Info, Activity, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

interface LocationPin {
    id: string;
    title: string;
    date: string;
    waktu: string;
    tempat: string;
    wilayah_text: string;
    isi_ringkas?: string | null;
    dihadiri_oleh?: string | null;
    lat: number;
    lng: number;
    status: string;
    marker_status: 'past' | 'today' | 'future';
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'today':
            return '#22c55e'; // Green (Hari Ini)
        case 'future':
            return '#3b82f6'; // Blue (Akan Datang)
        case 'past':
            return '#94a3b8'; // Gray
        default:
            return '#22c55e';
    }
};

const createCustomIcon = (status: string) => {
    const bgColor = getStatusColor(status);
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${bgColor}; width: 36px; height: 36px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                 <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

const DashboardMap = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pins, setPins] = useState<LocationPin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dateFilter, setDateFilter] = useState<string>('');

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersLayer = useRef<L.LayerGroup | null>(null);

    // Initial Map Setup
    useEffect(() => {
        if (!mapContainerRef.current || mapInstance.current) return;

        // Create map instance
        const map = L.map(mapContainerRef.current).setView([-7.352496, 108.106678], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Layer group for markers
        markersLayer.current = L.layerGroup().addTo(map);
        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Fetch API Data
    const fetchMarkers = async () => {
        try {
            const url = dateFilter ? `/api/dashboard/map-markers?date=${dateFilter}` : '/api/dashboard/map-markers';
            const res = await axios.get(url);
            if (Array.isArray(res.data)) {
                setPins(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch map markers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkers();
        const intervalId = setInterval(fetchMarkers, 20000);
        return () => clearInterval(intervalId);
    }, [dateFilter]);

    // Update map markers when pins change
    useEffect(() => {
        if (!mapInstance.current || !markersLayer.current) return;

        // Clear existing markers
        markersLayer.current.clearLayers();

        pins.forEach((pin) => {
            const icon = createCustomIcon(pin.marker_status);
            const marker = L.marker([pin.lat, pin.lng], { icon });

            const popupContent = `
                        <div style="font-family: inherit; min-width: 250px; padding: 4px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.4;">${pin.tempat}</h3>
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; line-height: 1.3;">
                                ${pin.wilayah_text ?? 'Tidak diketahui'}
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; width: 35%; vertical-align: top;">Perihal</td>
                                        <td style="padding: 4px 0; color: #0f172a; font-weight: 500; vertical-align: top;">${pin.title}</td>
                                    </tr>
                                    ${pin.isi_ringkas ? `
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Isi Ringkas</td>
                                        <td style="padding: 4px 0; color: #0f172a; font-weight: 500; vertical-align: top;">${pin.isi_ringkas}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Tanggal</td>
                                        <td style="padding: 4px 0; color: #0f172a; font-weight: 500; vertical-align: top;">${pin.date}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Waktu</td>
                                        <td style="padding: 4px 0; color: #0f172a; font-weight: 500; vertical-align: top;">${pin.waktu}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Status</td>
                                        <td style="padding: 4px 0; vertical-align: top;">
                                            <span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #475569;">
                                                ${pin.status}
                                            </span>
                                        </td>
                                    </tr>
                                    ${pin.dihadiri_oleh ? `
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Dihadiri</td>
                                        <td style="padding: 4px 0; color: #0f172a; font-weight: 500; vertical-align: top;">${pin.dihadiri_oleh}</td>
                                    </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
                setSelectedId(pin.id);
            });

            markersLayer.current?.addLayer(marker);
        });
    }, [pins]);

    // Fly to selected marker
    useEffect(() => {
        if (selectedId && mapInstance.current) {
            const activePin = pins.find(p => p.id === selectedId);
            if (activePin) {
                mapInstance.current.flyTo([activePin.lat, activePin.lng], 15, { duration: 1 });
            }
        }
    }, [selectedId, pins]);

    const activePin = pins.find(p => p.id === selectedId);

    return (
        <div className="bg-surface rounded-2xl border border-border-default overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-5 border-b border-border-default flex flex-col md:flex-row md:items-center justify-between bg-linear-to-r from-surface to-background-subtle gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary text-lg">Peta Jadwal Definitif</h3>
                        <p className="text-sm text-text-secondary flex items-center gap-1.5">
                            <Navigation className="h-3.5 w-3.5 text-primary" />
                            {selectedId ? `Agenda: ${activePin?.title}` : 'Tracking persebaran lokasi penjadwalan'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm z-50">
                        <Calendar className="h-4 w-4 text-text-secondary" />
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-surface border border-border-default text-text-primary text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                            title="Filter Tanggal"
                        />
                        {dateFilter && (
                            <button 
                                onClick={() => setDateFilter('')}
                                className="text-text-secondary hover:text-danger text-xs px-2 cursor-pointer relative z-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {selectedId && (
                        <button 
                            onClick={() => {
                                setSelectedId(null);
                                mapInstance.current?.flyTo([-7.352496, 108.106678], 11, { duration: 1 });
                            }}
                            className="bg-surface border border-border-default hover:bg-background-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer relative z-50"
                        >
                            <MapPin className="h-3 w-3" />
                            Zoom Out
                        </button>
                    )}
                    <div className="bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                        Auto-Update
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Map Area */}
                <div className="lg:col-span-2 relative h-[450px] lg:h-[550px] bg-background-subtle z-0">
                    {/* LEAFLET CONTAINER */}
                    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
                    
                    {loading && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-border-default shadow-xl flex items-center gap-3 z-50">
                            <Activity className="h-5 w-5 text-primary animate-spin" />
                            <span className="text-sm font-semibold text-text-primary">Memuat Data...</span>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4 bg-surface/95 backdrop-blur border border-border-default px-3 py-2 rounded-xl shadow-md text-[10px] sm:text-xs text-text-primary flex flex-col gap-2 z-400 pointer-events-none">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div> Hari Ini</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div> Akan Datang</div>
                    </div>
                </div>

                {/* Info Area */}
                <div className="bg-background-subtle/50 border-l border-border-default p-6 flex flex-col max-h-[450px] lg:max-h-[550px] overflow-y-auto">
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5 opacity-70 flex items-center gap-2">
                             Daftar Lokasi {dateFilter && '(Difilter)'}
                             <span className="flex-1 h-px bg-border-default"></span>
                        </h4>
                        
                        {pins.length === 0 && !loading && (
                            <div className="text-center py-10 opacity-60">
                                <MapPin className="h-8 w-8 mx-auto mb-2 text-text-tertiary" />
                                <p className="text-sm text-text-secondary">Tidak ada data jadwal dengan koordinat {dateFilter && 'pada tanggal ini'}.</p>
                            </div>
                        )}

                        <div className="space-y-4 relative z-10">
                            {pins.map((pin) => (
                                <button 
                                    key={pin.id} 
                                    onClick={() => setSelectedId(pin.id)}
                                    className={`w-full text-left bg-surface border p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group cursor-pointer ${
                                        selectedId === pin.id 
                                        ? 'border-primary ring-2 ring-primary/20 shadow-md flex-none' 
                                        : 'border-border-default hover:border-primary/40 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-1.5 rounded-lg transition-colors ${
                                            pin.marker_status === 'today' ? 'bg-green-50 text-green-600' :
                                            pin.marker_status === 'future' ? 'bg-blue-50 text-blue-600' :
                                            'bg-gray-50 text-gray-500'
                                        }`}>
                                            <MapPin className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                            selectedId === pin.id ? 'bg-primary/10 text-primary' : 'bg-background-subtle text-text-tertiary'
                                        }`}>
                                            {pin.date}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <h5 className={`text-[13px] font-bold leading-snug transition-colors line-clamp-2 ${
                                            selectedId === pin.id ? 'text-primary' : 'text-text-primary'
                                        }`}>
                                            {pin.title}
                                        </h5>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                                        <Info className="h-3 w-3 opacity-50" />
                                        <span className="truncate">{pin.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardMap;
