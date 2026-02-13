import { Head, useForm, Link } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import FormTextarea from '@/Components/form/FormTextarea';
import FormSelect from '@/Components/form/FormSelect';
import FormSelectWithCustom from '@/Components/form/FormSelectWithCustom';
import FormSearchableSelect from '@/Components/form/FormSearchableSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormFileUpload from '@/Components/form/FormFileUpload';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import type { PageProps } from '@/types';

interface JenisSurat {
    id: string;
    nama: string;
}

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
    level?: number;
    parent_id?: string;
}

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string | null;
}

interface SuratKeluarData {
    id: string;
    tanggal_surat: string;
    no_urut: string;
    nomor_surat: string;
    kepada: string;
    perihal: string;
    isi_ringkas: string;
    sifat_1: string;
    indeks_id: string | null;
    jenis_surat_id: string | null;
    kode_klasifikasi_id: string | null;
    unit_kerja_id: string | null;
    kode_pengolah: string | null;
    lampiran: number | null;
    catatan: string | null;
    file_path: string | null;
}

interface User {
    id: string;
    name: string;
    nip: string | null;
    jabatan: string | null;
}

interface Props extends PageProps {
    suratKeluar: SuratKeluarData;
    jenisSuratOptions: JenisSurat[];
    indeksBerkasOptions: IndeksSurat[];
    indeksKlasifikasiOptions: IndeksSurat[];
    unitKerja: UnitKerja[];
    users: User[];
    sifat1Options: Record<string, string>;
}

export default function Edit({ suratKeluar, jenisSuratOptions, indeksBerkasOptions, indeksKlasifikasiOptions, unitKerja, users, sifat1Options }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        tanggal_surat: suratKeluar.tanggal_surat?.split('T')[0] || '',
        no_urut: suratKeluar.no_urut || '',
        indeks_id: suratKeluar.indeks_id || '',
        kode_klasifikasi_id: suratKeluar.kode_klasifikasi_id || '',
        unit_kerja_id: suratKeluar.unit_kerja_id || '',
        kode_pengolah: suratKeluar.kode_pengolah || '',
        jenis_surat_id: suratKeluar.jenis_surat_id || '',
        sifat_1: suratKeluar.sifat_1 || '',
        nomor_surat: suratKeluar.nomor_surat || '',
        kepada: suratKeluar.kepada || '',
        lampiran: suratKeluar.lampiran?.toString() || '',
        perihal: suratKeluar.perihal || '',
        isi_ringkas: suratKeluar.isi_ringkas || '',
        catatan: suratKeluar.catatan || '',
        file: null as File | null,
    });

    // Indeks: hanya level Primer (level 1) dengan fitur search
    const indeksSelectOptions = indeksBerkasOptions.map((item) => ({
        value: item.id,
        label: `${item.kode} - ${item.nama}`,
    }));

    // Kode: children berdasarkan kode prefix dari indeks yang dipilih (level 2+)
    const kodeKlasifikasiOptions = useMemo(() => {
        if (!data.indeks_id) return [];
        const selectedIndeks = indeksBerkasOptions.find((item) => item.id === data.indeks_id);
        if (!selectedIndeks) return [];
        const prefix = selectedIndeks.kode + '.';
        return indeksKlasifikasiOptions
            .filter((item) => item.kode.startsWith(prefix))
            .map((item) => ({
                value: item.id,
                label: `${item.kode} - ${item.nama}`,
            }));
    }, [data.indeks_id, indeksBerkasOptions, indeksKlasifikasiOptions]);

    const unitKerjaOptions = unitKerja.map((item) => ({
        value: item.id,
        label: item.singkatan ? `${item.nama} (${item.singkatan})` : item.nama,
    }));

    // Kepada: hilangkan Sekpri Bupati dan Sekpri Wakil Bupati
    const userOptions = users
        .filter((item) => !['Sekpri Bupati', 'Sekpri Wakil Bupati'].includes(item.name))
        .map((item) => ({
            value: item.name,
            label: item.jabatan ? `${item.name} - ${item.jabatan}` : item.name,
        }));

    const sifat1SelectOptions = Object.entries(sifat1Options).map(([value, label]) => ({
        value,
        label,
    }));

    const jenisSuratSelectOptions = jenisSuratOptions.map((item) => ({
        value: item.id,
        label: item.nama,
    }));

    const selectedIndeks = indeksBerkasOptions.find(item => item.id === data.indeks_id);
    const selectedKode = indeksKlasifikasiOptions.find(item => item.id === data.kode_klasifikasi_id);

    // Map sifat_1 values to letter codes
    const getSifatCode = (sifat: string): string => {
        const sifatMap: Record<string, string> = {
            'biasa': 'B',
            'terbatas': 'T',
            'rahasia': 'R',
            'sangat_rahasia': 'SR',
        };
        return sifatMap[sifat] || sifat.toUpperCase();
    };

    // Auto-generate nomor_surat when dependencies change
    // Gunakan kode dari Kode Klasifikasi jika ada, kalau tidak gunakan kode dari Indeks
    useEffect(() => {
        const sifatCode = data.sifat_1 ? getSifatCode(data.sifat_1) : '';
        const noUrut = data.no_urut || '';
        const kode = selectedKode?.kode || selectedIndeks?.kode || '';
        const pengolah = data.kode_pengolah || '';
        const year = data.tanggal_surat ? new Date(data.tanggal_surat).getFullYear().toString() : '';

        // Only generate if we have at least sifat and no_urut
        if (sifatCode && noUrut) {
            const parts = [sifatCode, noUrut, kode, pengolah, year].filter(part => part !== '');
            const generatedNomor = parts.join('/');

            setData('nomor_surat', generatedNomor);
        }
    }, [data.sifat_1, data.no_urut, data.indeks_id, data.kode_klasifikasi_id, data.kode_pengolah, data.tanggal_surat]);

    const handleIndeksChange = (value: string) => {
        setData(prev => ({
            ...prev,
            indeks_id: value,
            kode_klasifikasi_id: '', // Reset kode saat indeks berubah
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('persuratan.surat-keluar.update', suratKeluar.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Surat Keluar" />

            <div className="py-6">
                <div className="w-full">
                    <div className="bg-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Edit Surat Keluar
                            </h1>
                            <p className="text-text-secondary text-sm mt-1">Ubah data surat keluar yang sudah ada</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="tanggal_surat" value="Tanggal Surat *" />
                                    <FormDatePicker
                                        id="tanggal_surat"
                                        value={data.tanggal_surat}
                                        onChange={(e) => setData('tanggal_surat', e.target.value)}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.tanggal_surat} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="no_urut" value="Nomor Urut *" />
                                    <TextInput
                                        id="no_urut"
                                        value={data.no_urut}
                                        onChange={(e) => setData('no_urut', e.target.value)}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.no_urut} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="indeks_id" value="Indeks" />
                                    <div className="mt-1">
                                        <FormSearchableSelect
                                            id="indeks_id"
                                            options={indeksSelectOptions}
                                            value={data.indeks_id}
                                            onChange={handleIndeksChange}
                                            placeholder="Pilih atau cari indeks..."
                                            error={errors.indeks_id}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="kode_klasifikasi_id" value="Kode" />
                                    <div className="mt-1">
                                        <FormSearchableSelect
                                            id="kode_klasifikasi_id"
                                            options={kodeKlasifikasiOptions}
                                            value={data.kode_klasifikasi_id}
                                            onChange={(value) => setData('kode_klasifikasi_id', value)}
                                            placeholder={data.indeks_id ? 'Pilih atau cari kode...' : 'Pilih indeks terlebih dahulu'}
                                            disabled={!data.indeks_id}
                                            error={errors.kode_klasifikasi_id}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="unit_kerja_id" value="Pengolah" />
                                    <FormSelect
                                        id="unit_kerja_id"
                                        options={unitKerjaOptions}
                                        value={data.unit_kerja_id}
                                        onChange={(e) => setData('unit_kerja_id', e.target.value)}
                                        placeholder="Pilih unit kerja pengolah"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.unit_kerja_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kode_pengolah" value="Kode Pengolah" />
                                    <TextInput
                                        id="kode_pengolah"
                                        value={data.kode_pengolah}
                                        onChange={(e) => setData('kode_pengolah', e.target.value)}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.kode_pengolah} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="jenis_surat_id" value="Jenis Surat" />
                                    <FormSelect
                                        id="jenis_surat_id"
                                        options={jenisSuratSelectOptions}
                                        value={data.jenis_surat_id}
                                        onChange={(e) => setData('jenis_surat_id', e.target.value)}
                                        placeholder="Pilih jenis surat"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.jenis_surat_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="sifat_1" value="Sifat *" />
                                    <FormSelect
                                        id="sifat_1"
                                        options={sifat1SelectOptions}
                                        value={data.sifat_1}
                                        onChange={(e) => setData('sifat_1', e.target.value)}
                                        placeholder="Pilih sifat"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.sifat_1} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nomor_surat" value="Nomor Surat *" />
                                    <TextInput
                                        id="nomor_surat"
                                        value={data.nomor_surat}
                                        readOnly
                                        placeholder="Otomatis terisi berdasarkan Sifat/NoUrut/Kode/Pengolah/Tahun"
                                        className="w-full mt-1 px-2 bg-surface-hover cursor-not-allowed"
                                    />
                                    <InputError message={errors.nomor_surat} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kepada" value="Kepada *" />
                                    <FormSelectWithCustom
                                        id="kepada"
                                        options={userOptions}
                                        value={data.kepada}
                                        onChange={(e) => setData('kepada', e.target.value)}
                                        placeholder="Pilih penerima atau ketik manual"
                                        customPlaceholder="Ketik nama penerima..."
                                        allowCustom={true}
                                        className="w-full mt-1"
                                    />
                                    <InputError message={errors.kepada} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="lampiran" value="Lampiran" />
                                    <TextInput
                                        id="lampiran"
                                        type="number"
                                        value={data.lampiran}
                                        onChange={(e) => setData('lampiran', e.target.value)}
                                        min="0"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.lampiran} className="mt-1" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="perihal" value="Perihal *" />
                                    <FormTextarea
                                        id="perihal"
                                        value={data.perihal}
                                        onChange={(e) => setData('perihal', e.target.value)}
                                        rows={2}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.perihal} className="mt-1" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="isi_ringkas" value="Isi Ringkas *" />
                                    <FormTextarea
                                        id="isi_ringkas"
                                        value={data.isi_ringkas}
                                        onChange={(e) => setData('isi_ringkas', e.target.value)}
                                        rows={4}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.isi_ringkas} className="mt-1" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="catatan" value="Catatan" />
                                    <FormTextarea
                                        id="catatan"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        rows={2}
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.catatan} className="mt-1" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Upload File Surat (Kosongkan jika tidak ingin mengubah)" />
                                    <FormFileUpload
                                        onChange={(file) => setData('file', file)}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                        maxSize={5}
                                        error={errors.file}
                                        currentFile={suratKeluar.file_path ? suratKeluar.file_path.split('/').pop() : undefined}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-6 border-t">
                                <Link href={route('persuratan.surat-keluar.index')}>
                                    <Button type="button" variant="secondary">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
