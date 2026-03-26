import { useState, useMemo } from 'react';
import { MapPin, Navigation, Info, RotateCcw, Clock, Users, RefreshCw } from 'lucide-react';

interface LocationPin {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    description: string;
    perihal: string;
    waktu: string;
    pejabat: string;
}

const DUMMY_PINS: LocationPin[] = [
    { 
        id: '1', 
        name: 'Gedung Bupati Tasikmalaya', 
        lat: -7.348632, 
        lng: 108.113245, 
        type: 'Pusat Pemerintahan',
        pejabat: 'Bupati Tasikmalaya',
        perihal: 'Penerimaan Tamu Spesial & Audiensi Luar Negeri',
        waktu: '08:00 - 10:00 WIB',
        description: 'Diskusi potensi investasi daerah bersama konsorsium internasional.'
    },
    { 
        id: '2', 
        name: 'Setda Kab. Tasikmalaya', 
        lat: -7.352496, 
        lng: 108.106678, 
        type: 'Sekretariat',
        pejabat: 'Sekretaris Daerah',
        perihal: 'Rapat Koordinasi Anggaran Perubahan',
        waktu: '10:30 - 12:00 WIB',
        description: 'Finalisasi draf kebijakan umum anggaran (KUA) tingkat kabupaten.'
    },
    { 
        id: '3', 
        name: 'Gedung DPRD Kab. Tasikmalaya', 
        lat: -7.351023, 
        lng: 108.104512, 
        type: 'Legislatif',
        pejabat: 'Ketua DPRD',
        perihal: 'Rapat Paripurna Persetujuan Raperda',
        waktu: '13:00 - 15:00 WIB',
        description: 'Pengambilan keputusan bersama terkait regulasi pengelolaan limbah industri.'
    },
    { 
        id: '4', 
        name: 'Dinas Pendidikan (Disdik)', 
        lat: -7.354012, 
        lng: 108.108045, 
        type: 'OPD',
        pejabat: 'Kepala Dinas Pendidikan',
        perihal: 'Sosialisasi Beasiswa Pemuda Berprestasi',
        waktu: '09:00 - 11:00 WIB',
        description: 'Penyampaian mekanisme seleksi beasiswa jenjang pendidikan tinggi.'
    },
    { 
        id: '5', 
        name: 'Dinas Kesehatan (Dinkes)', 
        lat: -7.356045, 
        lng: 108.109512, 
        type: 'OPD',
        pejabat: 'Kepala Dinas Kesehatan',
        perihal: 'Evaluasi Penurunan Angka Stunting',
        waktu: '14:00 - 16:00 WIB',
        description: 'Audit progress program tambahan gizi di puskesmas wilayah singaparna.'
    },
    { 
        id: '6', 
        name: 'Masjid Agung Baiturrahman', 
        lat: -7.349512, 
        lng: 108.112045, 
        type: 'Keagamaan',
        pejabat: 'Asisten Daerah I',
        perihal: 'Peringatan Hari Besar Islam (PHBI)',
        waktu: '16:00 - 17:30 WIB',
        description: 'Koordinasi teknis persiapan Gebyar Ramadhan tingkat kabupaten.'
    },
];

const DashboardMap = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Dynamic Zoom & Center logic
    const embedUrl = useMemo(() => {
        if (!selectedId) {
            // Updated broad query for Singaparna Government Center
            const centerQuery = encodeURIComponent('Perkantoran Pemda Kabupaten Tasikmalaya Bojong Koneng');
            return `https://www.google.com/maps?q=${centerQuery}&output=embed&z=15`;
        }

        const pin = DUMMY_PINS.find(p => p.id === selectedId);
        if (!pin) return '';

        // Precise Zoom on Coordinates
        return `https://www.google.com/maps?q=${pin.lat},${pin.lng}&z=18&output=embed`;
    }, [selectedId]);

    const handlePinClick = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
    };

    const activePin = useMemo(() => DUMMY_PINS.find(p => p.id === selectedId), [selectedId]);

    return (
        <div className="bg-surface rounded-2xl border border-border-default overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-5 border-b border-border-default flex items-center justify-between bg-linear-to-r from-surface to-background-subtle">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary text-lg">Peta Agenda Strategis Hari Ini</h3>
                        <p className="text-sm text-text-secondary flex items-center gap-1.5">
                            <Navigation className="h-3.5 w-3.5 text-primary" />
                            {selectedId ? `Lokasi: ${activePin?.name}` : 'Monitoring sebaran lokasi pejabat di wilayah kerja'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {selectedId && (
                        <button 
                            onClick={() => setSelectedId(null)}
                            className="bg-surface border border-border-default hover:bg-background-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-all"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Tampilkan Semua
                        </button>
                    )}
                    <div className="hidden md:flex bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                        Live Tracking
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Map Area */}
                <div className="lg:col-span-2 relative h-[450px] lg:h-[550px] bg-background-subtle">
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full border-0 filter contrast-[1.05]"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Dashboard Map"
                        key={selectedId || 'initial'} 
                    />
                    
                    {/* Floating Info Over Map when selected */}
                    {activePin && (
                        <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary text-text-inverse p-2 rounded-lg">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase font-black text-primary tracking-widest">{activePin.pejabat}</span>
                                        <span className="text-text-tertiary text-xs">•</span>
                                        <span className="text-xs font-bold text-text-primary flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {activePin.waktu}
                                        </span>
                                    </div>
                                    <h5 className="text-sm font-bold text-text-primary mb-1">{activePin.perihal}</h5>
                                    <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{activePin.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md border border-border-default px-3 py-1.5 rounded-lg shadow-sm text-xs text-text-primary flex items-center gap-2 pointer-events-none transition-opacity">
                        <Info className="h-3.5 w-3.5 text-primary" />
                        {selectedId ? 'Geser peta untuk navigasi mandiri' : 'Klik agenda di samping untuk detail lokasi'}
                    </div>
                </div>

                {/* Info Area */}
                <div className="bg-background-subtle/50 border-l border-border-default p-6 flex flex-col max-h-[550px] overflow-y-auto">
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5 opacity-70 flex items-center gap-2">
                             Agenda Berlangsung
                             <span className="flex-1 h-px bg-border-default"></span>
                        </h4>
                        <div className="space-y-4">
                            {DUMMY_PINS.map((pin) => (
                                <button 
                                    key={pin.id} 
                                    onClick={() => handlePinClick(pin.id)}
                                    className={`w-full text-left bg-surface border p-4 rounded-xl shadow-xs transition-all relative overflow-hidden group ${
                                        selectedId === pin.id 
                                        ? 'border-primary ring-4 ring-primary/5 shadow-md flex-none' 
                                        : 'border-border-default hover:border-primary/40 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-1.5 rounded-lg transition-colors ${selectedId === pin.id ? 'bg-primary text-text-inverse' : 'bg-primary/5 text-primary'}`}>
                                            <Users className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                            selectedId === pin.id ? 'bg-primary/10 text-primary' : 'bg-background-subtle text-text-tertiary'
                                        }`}>
                                            {pin.waktu.split(' ')[0]}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedId === pin.id ? 'text-primary' : 'text-text-tertiary'}`}>
                                            {pin.pejabat}
                                        </span>
                                        <h5 className={`text-[13px] font-bold leading-snug mt-0.5 transition-colors ${
                                            selectedId === pin.id ? 'text-primary' : 'text-text-primary'
                                        }`}>
                                            {pin.perihal}
                                        </h5>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-3">
                                        <MapPin className="h-3 w-3 opacity-50" />
                                        <span className="truncate italic">{pin.name}</span>
                                    </div>

                                    {selectedId === pin.id && (
                                        <div className="mt-3 pt-3 border-t border-border-default animate-in fade-in slide-in-from-top-1 duration-200">
                                            <p className="text-[11px] text-text-tertiary leading-relaxed">
                                                {pin.description}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border-default">
                        <button className="w-full py-3.5 bg-surface hover:bg-background-subtle text-text-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-sm active:scale-95 border border-border-default">
                            Perbarui Data Lokasi
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardMap;
