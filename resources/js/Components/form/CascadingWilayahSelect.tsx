import { useState, useEffect } from 'react';
import InputLabel from '@/Components/form/InputLabel';
import wilayahService, { Provinsi, Kabupaten, Kecamatan } from '@/services/wilayahService';

interface Props {
    value: {
        provinsi?: string;
        kabupaten?: string;
        kecamatan?: string;
        desa?: string;
    };
    onChange: (value: Props["value"]) => void;
    level: "provinsi" | "kabupaten" | "kecamatan" | "desa";
    errors?: {
        provinsi?: string;
        kabupaten?: string;
        kecamatan?: string;
        desa?: string;
    };
    disabled?: boolean;
}

export default function CascadingWilayahSelect({ value, onChange, level, errors, disabled = false }: Props) {
    const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
    const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);

    // Fetch Provinsi
    useEffect(() => {
        wilayahService.getAllProvinsi()
            .then(response => setProvinsiList(response.data))
            .catch(error => console.error('Error fetching provinsi:', error));
    }, []);

    // Fetch Kabupaten
    useEffect(() => {
        if (value.provinsi) {
            wilayahService.getKabupatenByProvinsi(value.provinsi)
                .then(response => setKabupatenList(response.data))
                .catch(error => console.error('Error fetching kabupaten:', error));
        } else {
            setKabupatenList([]);
        }
    }, [value.provinsi]);

    // Fetch Kecamatan
    useEffect(() => {
        if (value.provinsi && value.kabupaten) {
            wilayahService.getKecamatanByKabupaten(value.provinsi, value.kabupaten)
                .then(response => setKecamatanList(response.data))
                .catch(error => console.error('Error fetching kecamatan:', error));
        } else {
            setKecamatanList([]);
        }
    }, [value.provinsi, value.kabupaten]);

    const handleChange = (field: keyof Props["value"], val: string) => {
        const newValue = { ...value, [field]: val };

        // Reset lower levels
        if (field === 'provinsi') {
            newValue.kabupaten = '';
            newValue.kecamatan = '';
            newValue.desa = '';
        } else if (field === 'kabupaten') {
            newValue.kecamatan = '';
            newValue.desa = '';
        } else if (field === 'kecamatan') {
            newValue.desa = '';
        }

        onChange(newValue);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provinsi */}
            <div className="space-y-2">
                <InputLabel htmlFor="select-provinsi" value="Provinsi" />
                <select
                    id="select-provinsi"
                    className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                    value={value.provinsi || ''}
                    onChange={(e) => handleChange('provinsi', e.target.value)}
                    disabled={disabled}
                >
                    <option value="">Pilih Provinsi</option>
                    {provinsiList.map((item) => (
                        <option key={item.kode} value={item.kode}>{item.nama}</option>
                    ))}
                </select>
                {errors?.provinsi && <p className="text-sm text-danger">{errors.provinsi}</p>}
            </div>

            {/* Kabupaten */}
            {(level === 'kabupaten' || level === 'kecamatan' || level === 'desa') && (
                <div className="space-y-2">
                    <InputLabel htmlFor="select-kabupaten" value="Kabupaten" />
                    <select
                        id="select-kabupaten"
                        className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                        value={value.kabupaten || ''}
                        onChange={(e) => handleChange('kabupaten', e.target.value)}
                        disabled={disabled || !value.provinsi}
                    >
                        <option value="">Pilih Kabupaten</option>
                        {kabupatenList.map((item) => (
                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                        ))}
                    </select>
                    {errors?.kabupaten && <p className="text-sm text-danger">{errors.kabupaten}</p>}
                </div>
            )}

            {/* Kecamatan */}
            {(level === 'kecamatan' || level === 'desa') && (
                <div className="space-y-2">
                    <InputLabel htmlFor="select-kecamatan" value="Kecamatan" />
                    <select
                        id="select-kecamatan"
                        className="w-full border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                        value={value.kecamatan || ''}
                        onChange={(e) => handleChange('kecamatan', e.target.value)}
                        disabled={disabled || !value.kabupaten}
                    >
                        <option value="">Pilih Kecamatan</option>
                        {kecamatanList.map((item) => (
                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                        ))}
                    </select>
                    {errors?.kecamatan && <p className="text-sm text-danger">{errors.kecamatan}</p>}
                </div>
            )}
        </div>
    );
}
