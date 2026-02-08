import { Head, useForm, Link } from '@inertiajs/react';
import { Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/form/TextInput';
import FormTextarea from '@/Components/form/FormTextarea';
import FormSelect from '@/Components/form/FormSelect';
import FormSelectWithCustom from '@/Components/form/FormSelectWithCustom';
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormFileUpload from '@/Components/form/FormFileUpload';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import type { PageProps } from '@/types';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
}

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string | null;
}

interface Props extends PageProps {
    indeksSurat: IndeksSurat[];
    unitKerja: UnitKerja[];
    sifat1Options: Record<string, string>;
    nextNoUrut: number;
}

export default function Create({ indeksSurat, unitKerja, sifat1Options, nextNoUrut }: Props) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        tanggal_surat: today,
        no_urut: nextNoUrut.toString().padStart(4, '0'),
        indeks_id: '',
        kode_klasifikasi_id: '',
        unit_kerja_id: '',
        kode_pengolah: '',
        sifat_1: '',
        nomor_surat: '',
        kepada: '',
        perihal: '',
        lampiran: '',
        isi_ringkas: '',
        catatan: '',
        file: null as File | null,
    });

    const indeksOptions = indeksSurat.map((item) => ({
        value: item.id,
        label: `${item.kode} - ${item.nama}`,
    }));

    const unitKerjaOptions = unitKerja.map((item) => ({
        value: item.id,
        label: item.singkatan ? `${item.nama} (${item.singkatan})` : item.nama,
    }));

    const sifat1SelectOptions = Object.entries(sifat1Options).map(([value, label]) => ({
        value,
        label,
    }));

    const selectedIndeks = indeksSurat.find(item => item.id === data.indeks_id);

    const handleIndeksChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setData(prev => ({
            ...prev,
            indeks_id: selectedId,
            kode_klasifikasi_id: selectedId,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('persuratan.surat-keluar.store'), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Tambah Surat Keluar" />

            <div className="py-6">
                <div className="w-full">
                    <div className="bg-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Tambah Surat Keluar
                            </h1>
                            <p className="text-text-secondary text-sm mt-1">Lengkapi formulir di bawah ini untuk menambahkan surat keluar baru</p>
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
                                    <FormSelect
                                        id="indeks_id"
                                        options={indeksOptions}
                                        value={data.indeks_id}
                                        onChange={handleIndeksChange}
                                        placeholder="Pilih indeks"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.indeks_id} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kode_display" value="Kode" />
                                    <TextInput
                                        id="kode_display"
                                        value={selectedIndeks?.kode || ''}
                                        readOnly
                                        className="w-full mt-1 px-2 bg-surface-hover cursor-not-allowed"
                                        placeholder="Otomatis terisi saat memilih Indeks"
                                    />
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
                                    <InputLabel htmlFor="sifat_1" value="Sifat *" />
                                    <FormSelectWithCustom
                                        id="sifat_1"
                                        options={sifat1SelectOptions}
                                        value={data.sifat_1}
                                        onChange={(e) => setData('sifat_1', e.target.value)}
                                        placeholder="Pilih sifat"
                                        customPlaceholder="Ketik sifat surat lainnya..."
                                        allowCustom={true}
                                        className="w-full mt-1"
                                    />
                                    <InputError message={errors.sifat_1} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nomor_surat" value="Nomor Surat *" />
                                    <TextInput
                                        id="nomor_surat"
                                        value={data.nomor_surat}
                                        onChange={(e) => setData('nomor_surat', e.target.value)}
                                        placeholder="Masukkan nomor surat"
                                        className="w-full mt-1 px-2"
                                    />
                                    <InputError message={errors.nomor_surat} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="kepada" value="Kepada *" />
                                    <TextInput
                                        id="kepada"
                                        value={data.kepada}
                                        onChange={(e) => setData('kepada', e.target.value)}
                                        placeholder="Tujuan surat"
                                        className="w-full mt-1 px-2"
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
                                    <InputLabel value="Upload File Surat (Word/PDF/JPG)" />
                                    <FormFileUpload
                                        onChange={(file) => setData('file', file)}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                        maxSize={5}
                                        error={errors.file}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-6 border-t">
                                <Link href={route('persuratan.surat-keluar.index')}>
                                    <Button type="button" variant="secondary">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
