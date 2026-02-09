import { useState, useEffect } from 'react';
import wilayahService, { Provinsi, Kabupaten, Kecamatan, Desa } from '@/services/wilayahService';

// Fixed Kabupaten Tasikmalaya code
const TASIKMALAYA_PROVINSI = '32'; // Jawa Barat
const TASIKMALAYA_KABUPATEN = '06'; // Kabupaten Tasikmalaya

interface WilayahFormData {
    lokasi_type?: string;
    kode_wilayah?: string;
    [key: string]: unknown;
}

interface WilayahFormHelpers {
    data: WilayahFormData;
    setData: (field: string, value: unknown) => void;
}

export function useWilayahCascade(form: WilayahFormHelpers) {
    const { data, setData } = form;

    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedDesa, setSelectedDesa] = useState('');

    // Load provinsi list for luar_daerah
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah') {
            wilayahService.getAllProvinsi()
                .then(response => setProvinsiList(response.data))
                .catch(() => setError('Gagal memuat data provinsi.'));
        }
    }, [data.lokasi_type]);

    // Load kecamatan list for dalam_daerah (fixed to Tasikmalaya)
    useEffect(() => {
        if (data.lokasi_type === 'dalam_daerah') {
            wilayahService.getKecamatanByKabupaten(TASIKMALAYA_PROVINSI, TASIKMALAYA_KABUPATEN)
                .then(response => setKecamatanList(response.data))
                .catch(() => setError('Gagal memuat data kecamatan.'));
        }
    }, [data.lokasi_type]);

    // Load kabupaten when provinsi changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi) {
            wilayahService.getKabupatenByProvinsi(selectedProvinsi)
                .then(response => setKabupatenList(response.data))
                .catch(() => setError('Gagal memuat data kabupaten.'));
        } else {
            setKabupatenList([]);
        }
    }, [selectedProvinsi, data.lokasi_type]);

    // Load kecamatan when kabupaten changes (luar_daerah)
    useEffect(() => {
        if (data.lokasi_type === 'luar_daerah' && selectedProvinsi && selectedKabupaten) {
            wilayahService.getKecamatanByKabupaten(selectedProvinsi, selectedKabupaten)
                .then(response => setKecamatanList(response.data))
                .catch(() => setError('Gagal memuat data kecamatan.'));
        }
    }, [selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Load desa when kecamatan changes
    useEffect(() => {
        const provKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_PROVINSI : selectedProvinsi;
        const kabKode = data.lokasi_type === 'dalam_daerah' ? TASIKMALAYA_KABUPATEN : selectedKabupaten;
        if (provKode && kabKode && selectedKecamatan) {
            wilayahService.getDesaByKecamatan(provKode, kabKode, selectedKecamatan)
                .then(response => setDesaList(response.data))
                .catch(() => setError('Gagal memuat data desa.'));
        } else {
            setDesaList([]);
        }
    }, [selectedKecamatan, selectedKabupaten, selectedProvinsi, data.lokasi_type]);

    // Reset wilayah selections when lokasi_type changes
    useEffect(() => {
        if (data.lokasi_type) {
            setSelectedProvinsi('');
            setSelectedKabupaten('');
            setSelectedKecamatan('');
            setSelectedDesa('');
            setData('kode_wilayah', '');
            setError(null);
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
        error,
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
