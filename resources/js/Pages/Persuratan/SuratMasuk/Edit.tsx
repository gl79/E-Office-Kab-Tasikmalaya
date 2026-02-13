import { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import FormWizard from '@/Components/form/FormWizard';
import TextInput from '@/Components/form/TextInput';
import FormTextarea from '@/Components/form/FormTextarea';
import FormSelect from '@/Components/form/FormSelect';
import FormSearchableSelect from '@/Components/form/FormSearchableSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormMultiSelect from '@/Components/form/FormMultiSelect';
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

interface User {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string | null;
}

interface SuratMasukTujuan {
    id: string;
    tujuan_id: number | null;
    tujuan: string;
}

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    tanggal_diterima: string;
    tanggal_surat: string;
    asal_surat: string;
    nomor_surat: string;
    jenis_surat_id: string | null;
    sifat: string;
    lampiran: number | null;
    perihal: string;
    isi_ringkas: string;
    indeks_berkas_id: string | null;
    indeks_berkas_custom: string | null;
    kode_klasifikasi_id: string | null;
    staff_pengolah_id: number | null;
    tanggal_diteruskan: string | null;
    catatan_tambahan: string | null;
    file_path: string | null;
    tujuans: SuratMasukTujuan[];
}

interface Props extends PageProps {
    suratMasuk: SuratMasuk;
    jenisSuratOptions: JenisSurat[];
    indeksBerkasOptions: IndeksSurat[];
    indeksKlasifikasiOptions: IndeksSurat[];
    users: User[];
    sifatOptions: Record<string, string>;
}

export default function Edit({ suratMasuk, jenisSuratOptions, indeksBerkasOptions, indeksKlasifikasiOptions, users, sifatOptions }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepError, setStepError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        tanggal_surat: suratMasuk.tanggal_surat || '',
        asal_surat: suratMasuk.asal_surat || '',
        tujuan: suratMasuk.tujuans?.map((t) => t.tujuan_id ? t.tujuan_id.toString() : t.tujuan) || [],
        nomor_surat: suratMasuk.nomor_surat || '',
        jenis_surat_id: suratMasuk.jenis_surat_id || '',
        sifat: suratMasuk.sifat || '',
        lampiran: suratMasuk.lampiran?.toString() || '',
        perihal: suratMasuk.perihal || '',
        isi_ringkas: suratMasuk.isi_ringkas || '',
        tanggal_diterima: suratMasuk.tanggal_diterima || '',
        nomor_agenda: suratMasuk.nomor_agenda || '',
        indeks_berkas_id: suratMasuk.indeks_berkas_id || '',
        indeks_berkas_custom: suratMasuk.indeks_berkas_custom || '',
        kode_klasifikasi_id: suratMasuk.kode_klasifikasi_id || '',
        staff_pengolah_id: suratMasuk.staff_pengolah_id?.toString() || '',
        tanggal_diteruskan: suratMasuk.tanggal_diteruskan || '',
        catatan_tambahan: suratMasuk.catatan_tambahan || '',
        file: null as File | null,
    });

    const steps = [
        { title: 'Identitas Surat', description: 'Data surat' },
        { title: 'Identitas Agenda', description: 'Data agenda & file' },
    ];

    // Indeks Berkas: level 1 (Primer) dan level 2 (Sub Primer)
    const indeksBerkasSelectOptions = indeksBerkasOptions.map((item) => ({
        value: item.id,
        label: `${item.kode} - ${item.nama}`,
    }));

    // Kode Klasifikasi: level 3+ (berdasarkan kode prefix dari indeks berkas yang dipilih)
    const kodeKlasifikasiOptions = useMemo(() => {
        if (!data.indeks_berkas_id) return [];
        const selectedIndeks = indeksBerkasOptions.find((item) => item.id === data.indeks_berkas_id);
        if (!selectedIndeks) return [];
        const prefix = selectedIndeks.kode + '.';
        return indeksKlasifikasiOptions
            .filter((item) => item.kode.startsWith(prefix))
            .map((item) => ({
                value: item.id,
                label: `${item.kode} - ${item.nama}`,
            }));
    }, [data.indeks_berkas_id, indeksBerkasOptions, indeksKlasifikasiOptions]);

    // Tujuan Surat: hilangkan Sekpri Bupati dan Sekpri Wakil Bupati
    const userOptions = users
        .filter((user) => !['Sekpri Bupati', 'Sekpri Wakil Bupati'].includes(user.name))
        .map((user) => ({
            value: user.id.toString(),
            label: user.nip ? `${user.name} (${user.nip})` : user.name,
        }));

    // Staff Pengolah: semua user kecuali Sekpri Bupati dan Sekpri Wakil Bupati
    const staffPengolahOptions = users
        .filter((user) => !['Sekpri Bupati', 'Sekpri Wakil Bupati'].includes(user.name))
        .map((user) => ({
            value: user.id.toString(),
            label: user.nip ? `${user.name} (${user.nip})` : user.name,
        }));

    const jenisSuratSelectOptions = jenisSuratOptions.map((item) => ({
        value: item.id,
        label: item.nama,
    }));

    const sifatSelectOptions = Object.entries(sifatOptions).map(([value, label]) => ({
        value,
        label,
    }));

    const validateStep1 = () => {
        const requiredFields = ['tanggal_surat', 'asal_surat', 'nomor_surat', 'sifat', 'perihal', 'isi_ringkas'];
        const hasErrors = requiredFields.some((field) => !data[field as keyof typeof data]);
        const hasTujuan = data.tujuan.length > 0;

        if (hasErrors || !hasTujuan) {
            setStepError('Mohon lengkapi semua field yang wajib diisi.');
            return false;
        }
        setStepError('');
        return true;
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentStep === 0 && !validateStep1()) {
            return;
        }
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('persuratan.surat-masuk.update', suratMasuk.id), {
            forceFormData: true,
        });
    };

    const handleIndeksBerkasChange = (value: string) => {
        setData((prevData) => ({
            ...prevData,
            indeks_berkas_id: value,
            indeks_berkas_custom: '',
            kode_klasifikasi_id: '', // Reset kode klasifikasi saat indeks berkas berubah
        }));
    };

    const handleIndeksBerkasCustomChange = (customValue: string) => {
        setData((prevData) => ({
            ...prevData,
            indeks_berkas_id: '',
            indeks_berkas_custom: customValue,
            kode_klasifikasi_id: '', // Reset kode klasifikasi saat custom input
        }));
    };

    return (
        <AppLayout>
            <Head title="Edit Surat Masuk" />

            <div className="py-6">
                <div className="w-full">
                    <div className="bg-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Edit Surat Masuk
                            </h1>
                            <p className="text-text-secondary text-sm mt-1">Perbarui informasi surat masuk pada formulir di bawah ini</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {stepError && (
                                <div className="mb-4 p-4 bg-danger-light border border-danger-light text-danger rounded-lg">
                                    {stepError}
                                </div>
                            )}
                            <FormWizard steps={steps} currentStep={currentStep}>
                                {/* Step 1: Identitas Surat */}
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="tanggal_surat" value="Tanggal Surat" required />
                                                <FormDatePicker
                                                    id="tanggal_surat"
                                                    value={data.tanggal_surat}
                                                    onChange={(e) => setData('tanggal_surat', e.target.value)}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.tanggal_surat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="asal_surat" value="Asal Surat" required />
                                                <TextInput
                                                    id="asal_surat"
                                                    value={data.asal_surat}
                                                    onChange={(e) => setData('asal_surat', e.target.value)}
                                                    placeholder="Masukkan asal surat"
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.asal_surat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel value="Kepada (Tujuan Surat)" required />
                                                <div className="mt-1">
                                                    <FormMultiSelect
                                                        options={userOptions}
                                                        value={data.tujuan}
                                                        onChange={(value) => setData('tujuan', value)}
                                                        placeholder="Pilih tujuan surat..."
                                                        allowCustom={true}
                                                        customPlaceholder="Tambah tujuan lainnya..."
                                                        error={errors.tujuan}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_surat" value="Nomor Surat" required />
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
                                                <InputLabel htmlFor="jenis_surat_id" value="Jenis Surat" />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="jenis_surat_id"
                                                        options={jenisSuratSelectOptions}
                                                        value={data.jenis_surat_id}
                                                        onChange={(value) => setData('jenis_surat_id', value)}
                                                        placeholder="Pilih atau cari jenis surat..."
                                                        error={errors.jenis_surat_id}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="sifat" value="Sifat Surat" required />
                                                <FormSelect
                                                    id="sifat"
                                                    options={sifatSelectOptions}
                                                    value={data.sifat}
                                                    onChange={(e) => setData('sifat', e.target.value)}
                                                    placeholder="Pilih sifat surat"
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.sifat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="lampiran" value="Lampiran" />
                                                <TextInput
                                                    id="lampiran"
                                                    type="number"
                                                    value={data.lampiran}
                                                    onChange={(e) => setData('lampiran', e.target.value)}
                                                    placeholder="Jumlah lampiran"
                                                    min="0"
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.lampiran} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="perihal" value="Perihal" required />
                                                <FormTextarea
                                                    id="perihal"
                                                    value={data.perihal}
                                                    onChange={(e) => setData('perihal', e.target.value)}
                                                    placeholder="Masukkan perihal surat"
                                                    rows={2}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.perihal} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="isi_ringkas" value="Isi Ringkas Surat" required />
                                                <FormTextarea
                                                    id="isi_ringkas"
                                                    value={data.isi_ringkas}
                                                    onChange={(e) => setData('isi_ringkas', e.target.value)}
                                                    placeholder="Masukkan ringkasan isi surat"
                                                    rows={4}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.isi_ringkas} className="mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Identitas Agenda */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="tanggal_diterima" value="Tanggal Diterima" required />
                                                <FormDatePicker
                                                    id="tanggal_diterima"
                                                    value={data.tanggal_diterima}
                                                    onChange={(e) => setData('tanggal_diterima', e.target.value)}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.tanggal_diterima} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_agenda" value="No Urut/Agenda" required />
                                                <TextInput
                                                    id="nomor_agenda"
                                                    value={data.nomor_agenda.split('/')[1] || data.nomor_agenda}
                                                    readOnly
                                                    className="w-full mt-1 px-2 bg-gray-100 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-text-secondary mt-1">No urut/agenda tidak dapat diubah</p>
                                                <InputError message={errors.nomor_agenda} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="indeks_berkas_id" value="Indeks Berkas" />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="indeks_berkas_id"
                                                        options={indeksBerkasSelectOptions}
                                                        value={data.indeks_berkas_id}
                                                        onChange={handleIndeksBerkasChange}
                                                        onCustomChange={handleIndeksBerkasCustomChange}
                                                        customValue={data.indeks_berkas_custom}
                                                        placeholder="Pilih atau cari indeks berkas..."
                                                        allowCustom={true}
                                                        customPlaceholder="Ketik indeks berkas manual..."
                                                        error={errors.indeks_berkas_id || errors.indeks_berkas_custom}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="kode_klasifikasi_id" value="Kode Klasifikasi" />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="kode_klasifikasi_id"
                                                        options={kodeKlasifikasiOptions}
                                                        value={data.kode_klasifikasi_id}
                                                        onChange={(value) => setData('kode_klasifikasi_id', value)}
                                                        placeholder={data.indeks_berkas_id ? 'Pilih atau cari kode klasifikasi...' : 'Pilih indeks berkas terlebih dahulu'}
                                                        disabled={!data.indeks_berkas_id}
                                                        error={errors.kode_klasifikasi_id}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="staff_pengolah_id" value="Staff Pengolah" />
                                                <FormSelect
                                                    id="staff_pengolah_id"
                                                    options={staffPengolahOptions}
                                                    value={data.staff_pengolah_id}
                                                    onChange={(e) => setData('staff_pengolah_id', e.target.value)}
                                                    placeholder="Pilih staff pengolah"
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.staff_pengolah_id} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="tanggal_diteruskan" value="Tanggal Diteruskan" />
                                                <FormDatePicker
                                                    id="tanggal_diteruskan"
                                                    value={data.tanggal_diteruskan}
                                                    onChange={(e) => setData('tanggal_diteruskan', e.target.value)}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.tanggal_diteruskan} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="catatan_tambahan" value="Catatan Tambahan" />
                                                <FormTextarea
                                                    id="catatan_tambahan"
                                                    value={data.catatan_tambahan}
                                                    onChange={(e) => setData('catatan_tambahan', e.target.value)}
                                                    placeholder="Catatan internal (opsional)"
                                                    rows={3}
                                                    className="w-full mt-1 px-2"
                                                />
                                                <InputError message={errors.catatan_tambahan} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel value="Upload File Surat Digital" />
                                                <div className="mt-1">
                                                    <FormFileUpload
                                                        onChange={(file) => setData('file', file)}
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                                        maxSize={5}
                                                        currentFile={suratMasuk.file_path}
                                                        error={errors.file}
                                                    />
                                                    <p className="text-sm text-text-secondary mt-1">
                                                        Kosongkan jika tidak ingin mengubah file
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </FormWizard>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <div>
                                    {currentStep > 0 && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handlePrevious}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Kembali
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('persuratan.surat-masuk.index')}>
                                        <Button type="button" variant="secondary">
                                            Batal
                                        </Button>
                                    </Link>
                                    {currentStep < steps.length - 1 ? (
                                        <Button type="button" onClick={handleNext}>
                                            Lanjut
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={processing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
