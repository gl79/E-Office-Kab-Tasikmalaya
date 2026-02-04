import { useState, useEffect, useCallback } from 'react';
import wilayahService, { Provinsi, Kabupaten, Kecamatan, Desa } from '@/services/wilayahService';

interface UseWilayahCascadeOptions {
    lokasiType: string;
    initialKodeWilayah?: string;
}

interface UseWilayahCascadeReturn {
    // Lists
    provinsiList: Provinsi[];
    kabupatenList: Kabupaten[];
    kecamatanList: Kecamatan[];
    desaList: Desa[];

    // Selected values
    selectedProvinsi: string;
    selectedKabupaten: string;
    selectedKecamatan: string;
    selectedDesa: string;

    // Setters
    setSelectedProvinsi: (kode: string) => void;
    setSelectedKabupaten: (kode: string) => void;
    setSelectedKecamatan: (kode: string) => void;
    setSelectedDesa: (kode: string) => void;

    // Computed
    kodeWilayah: string;

    // Reset
    resetSelections: () => void;
}

// Fixed Kabupaten Tasikmalaya code for dalam_daerah
const TASIKMALAYA_PROVINSI = '32'; // Jawa Barat
const TASIKMALAYA_KABUPATEN = '06'; // Kabupaten Tasikmalaya

export function useWilayahCascade({ lokasiType, initialKodeWilayah }: UseWilayahCascadeOptions): UseWilayahCascadeReturn {
    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);

    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedDesa, setSelectedDesa] = useState('');

    // Parse initial kode_wilayah if provided
    useEffect(() => {
        if (initialKodeWilayah && lokasiType) {
            const parts = initialKodeWilayah.split('.');
            if (parts.length >= 4) {
                if (lokasiType === 'luar_daerah') {
                    setSelectedProvinsi(parts[0]);
                    setSelectedKabupaten(parts[1]);
                }
                setSelectedKecamatan(parts[2]);
                setSelectedDesa(parts[3]);
            }
        }
    }, [initialKodeWilayah, lokasiType]);

    // Load provinsi list for luar_daerah
    useEffect(() => {
        if (lokasiType === 'luar_daerah') {
            wilayahService.getAllProvinsi()
                .then(response => setProvinsiList(response.data))
                .catch(error => console.error('Error fetching provinsi:', error));
        }
    }, [lokasiType]);

    // Load kecamatan list for dalam_daerah (fixed to Tasikmalaya)
    useEffect(() => {
        if (lokasiType === 'dalam_daerah') {
            wilayahService.getKecamatanByKabupaten(TASIKMALAYA_PROVINSI, TASIKMALAYA_KABUPATEN)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [lokasiType]);

    // Load kabupaten when provinsi changes (luar_daerah)
    useEffect(() => {
        if (lokasiType === 'luar_daerah' && selectedProvinsi) {
            wilayahService.getKabupatenByProvinsi(selectedProvinsi)
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
        }
    }, [selectedProvinsi, lokasiType]);

    // Load kecamatan when kabupaten changes (luar_daerah)
    useEffect(() => {
        if (lokasiType === 'luar_daerah' && selectedProvinsi && selectedKabupaten) {
            wilayahService.getKecamatanByKabupaten(selectedProvinsi, selectedKabupaten)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [selectedKabupaten, selectedProvinsi, lokasiType]);

    // Load desa when kecamatan changes
    useEffect(() => {
        const provKode = lokasiType === 'dalam_daerah' ? TASIKMALAYA_PROVINSI : selectedProvinsi;
        const kabKode = lokasiType === 'dalam_daerah' ? TASIKMALAYA_KABUPATEN : selectedKabupaten;
        if (provKode && kabKode && selectedKecamatan) {
            wilayahService.getDesaByKecamatan(provKode, kabKode, selectedKecamatan)
                .then(response => setDesaList(response.data))
                .catch(error => console.error('Error fetching desa:', error));
        } else {
            setDesaList([]);
        }
    }, [selectedKecamatan, selectedKabupaten, selectedProvinsi, lokasiType]);

    // Compute kode_wilayah
    const kodeWilayah = (() => {
        if (lokasiType === 'dalam_daerah' && selectedKecamatan && selectedDesa) {
            return `${TASIKMALAYA_PROVINSI}.${TASIKMALAYA_KABUPATEN}.${selectedKecamatan}.${selectedDesa}`;
        }
        if (lokasiType === 'luar_daerah' && selectedProvinsi && selectedKabupaten && selectedKecamatan && selectedDesa) {
            return `${selectedProvinsi}.${selectedKabupaten}.${selectedKecamatan}.${selectedDesa}`;
        }
        return '';
    })();

    const resetSelections = useCallback(() => {
        setSelectedProvinsi('');
        setSelectedKabupaten('');
        setSelectedKecamatan('');
        setSelectedDesa('');
        setKabupatenList([]);
        setKecamatanList([]);
        setDesaList([]);
    }, []);

    // Reset when lokasi_type changes
    useEffect(() => {
        resetSelections();
    }, [lokasiType, resetSelections]);

    return {
        provinsiList,
        kabupatenList,
        kecamatanList,
        desaList,
        selectedProvinsi,
        selectedKabupaten,
        selectedKecamatan,
        selectedDesa,
        setSelectedProvinsi,
        setSelectedKabupaten,
        setSelectedKecamatan,
        setSelectedDesa,
        kodeWilayah,
        resetSelections,
    };
}

export default useWilayahCascade;
