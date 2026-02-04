import { useState, useEffect } from 'react';
import wilayahService, { Provinsi, Kabupaten, Kecamatan, Desa } from '@/services/wilayahService';

// Fixed Kabupaten Tasikmalaya code
const TASIKMALAYA_PROVINSI = '32'; // Jawa Barat
const TASIKMALAYA_KABUPATEN = '06'; // Kabupaten Tasikmalaya

interface MockInertiaHelpers {
    data: any;
    setData: (field: string, value: any) => void;
}

export function useWilayahCascade(form: MockInertiaHelpers) {
    const { data, setData } = form;

    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);

    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedDesa, setSelectedDesa] = useState('');

    // Load provinsi list for luar_daerah
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah') {
            wilayahService.getAllProvinsi()
                .then(response => setProvinsiList(response.data))
                .catch(error => console.error('Error fetching provinsi:', error));
        }
    }, [data.lokasi_type]);

    // Load kecamatan list for dalam_daerah (fixed to Tasikmalaya)
    useEffect(() => {
        if (data.lokasi_type === 'dalam_daerah') {
            wilayahService.getKecamatanByKabupaten(TASIKMALAYA_PROVINSI, TASIKMALAYA_KABUPATEN)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [data.lokasi_type]);

    // Load kabupaten when provinsi changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi) {
            wilayahService.getKabupatenByProvinsi(selectedProvinsi)
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
        }
    }, [selectedProvinsi, data.lokasi_type]);

    // Load kecamatan when kabupaten changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi && selectedKabupaten) {
            wilayahService.getKecamatanByKabupaten(selectedProvinsi, selectedKabupaten)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        }
    }, [selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Load desa when kecamatan changes
    useEffect(() => {
        const provKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_PROVINSI : selectedProvinsi;
        const kabKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_KABUPATEN : selectedKabupaten;
        if (provKode && kabKode && selectedKecamatan) {
            wilayahService.getDesaByKecamatan(provKode, kabKode, selectedKecamatan)
                .then(response => setDesaList(response.data))
                .catch(error => console.error('Error fetching desa:', error));
        } else {
            setDesaList([]);
        }
    }, [selectedKecamatan, selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Reset wilayah selections when lokasi_type changes
    useEffect(() => {
        if (data.lokasi_type) {
            // Only reset if it's a real change interaction, though this runs on every change of data.lokasi_type
            // Ideally we might want to manually trigger resets, but this mimics original behavior
            setSelectedProvinsi('');
            setSelectedKabupaten('');
            setSelectedKecamatan('');
            setSelectedDesa('');
            setData('kode_wilayah', '');
        }
    }, [data.lokasi_type]);

    // Update kode_wilayah when desa is selected
    useEffect(() => {
        if (selectedDesa) {
            setData('kode_wilayah', selectedDesa);
        }
    }, [selectedDesa]);

    return {
        provinsiList,
        kabupatenList,
        kecamatanList,
        desaList,
        selectedProvinsi,
        setSelectedProvinsi,
        selectedKabupaten,
        setSelectedKabupaten,
        selectedKecamatan,
        setSelectedKecamatan,
        selectedDesa,
        setSelectedDesa,
    };
}
