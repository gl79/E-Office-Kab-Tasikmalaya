import { useState, useMemo, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import FormWizard from '@/Components/form/FormWizard';
import TextInput from '@/Components/form/TextInput';
import FormTextarea from '@/Components/form/FormTextarea';
import FormSearchableSelect from '@/Components/form/FormSearchableSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormMultiSelect from '@/Components/form/FormMultiSelect';
import FormFileUpload from '@/Components/form/FormFileUpload';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import type { PageProps } from '@/types';
import { buildInternalUserOptions, formatUserLabel } from '@/utils';

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
    jabatan_nama: string | null;
}

interface Props extends PageProps {
    jenisSuratOptions: JenisSurat[];
    indeksBerkasOptions: IndeksSurat[];
    indeksKlasifikasiOptions: IndeksSurat[];
    users: User[];
    staffPengolahUsers: User[];
    asalSuratUsers: User[];
    sifatOptions: Record<string, string>;
    nextNomorAgenda: string;
}

export default function Create({
    jenisSuratOptions,
    indeksBerkasOptions,
    indeksKlasifikasiOptions,
    users,
    staffPengolahUsers,
    asalSuratUsers,
    sifatOptions,
    nextNomorAgenda
}: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepError, setStepError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        // Step 1: Identitas Surat
        tanggal_surat: today,
        asal_surat: '',
        tujuan: [] as string[],
        nomor_surat: '',
        jenis_surat_id: '',
        sifat: '',
        lampiran: '',
        perihal: '',
        isi_ringkas: '',
        // Step 2: Identitas Agenda
        tanggal_diterima: today,
        nomor_agenda: nextNomorAgenda,
        indeks_berkas_id: '',
        kode_klasifikasi_id: '',
        staff_pengolah_id: '',
        tanggal_diteruskan: today,
        catatan_tambahan: '',
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

    const internalUserOptions = buildInternalUserOptions(users, {
        includeNameInLabel: true,
        specialJabatanOnly: true,
    });
    const userOptions = internalUserOptions;
    const staffPengolahOptions = buildInternalUserOptions(staffPengolahUsers, {
        includeNameInLabel: true,
        specialJabatanOnly: true,
    });

    const asalSuratOptions = asalSuratUsers.map((user) => {
        const label = formatUserLabel(user, {
            includeNameInLabel: true,
            specialJabatanOnly: true,
        });
        return {
            value: label,
            label,
        };
    });

    const jenisSuratSelectOptions = jenisSuratOptions.map((item) => ({
        value: item.id,
        label: item.nama,
    }));

    const sifatSelectOptions = Object.entries(sifatOptions).map(([value, label]) => ({
        value,
        label,
    }));

    const validateStep1 = () => {
        const requiredFields = [
            'tanggal_surat',
            'asal_surat',
            'nomor_surat',
            'jenis_surat_id',
            'sifat',
            'lampiran',
            'perihal'
        ];
        const hasErrors = requiredFields.some((field) => !data[field as keyof typeof data]);
        const hasTujuan = data.tujuan.length > 0;

        if (hasErrors || !hasTujuan) {
            setStepError('Mohon lengkapi semua field yang wajib diisi.');
            return false;
        }
        setStepError('');
        return true;
    };

    const validateStep2 = () => {
        const requiredFields = [
            'tanggal_diterima',
            'nomor_agenda',
            'indeks_berkas_id',
            'kode_klasifikasi_id',
            'staff_pengolah_id',
            'tanggal_diteruskan',
        ];
        const hasErrors = requiredFields.some((field) => !data[field as keyof typeof data]);
        const hasFile = !!data.file;

        if (hasErrors || !hasFile) {
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
        if (!validateStep2()) {
            return;
        }

        post(route('persuratan.surat-masuk.store'), {
            forceFormData: true,
        });
    };

    // Auto-fill Staff Pengolah saat Kepada diisi 1 user internal
    useEffect(() => {
        if (data.tujuan.length === 1) {
            const selected = data.tujuan[0];
            const isNumericId = /^\d+$/.test(selected);
            if (isNumericId) {
                const matched = staffPengolahUsers.find((u) => u.id.toString() === selected);
                if (matched) {
                    setData('staff_pengolah_id', selected);
                }
            }
        }
    }, [data.tujuan]);

    const handleIndeksBerkasChange = (value: string) => {
        setData((prevData) => ({
            ...prevData,
            indeks_berkas_id: value,
            kode_klasifikasi_id: '', // Reset kode klasifikasi saat indeks berkas berubah
        }));
    };

    return (
        <AppLayout>
            <Head title="Tambah Surat Masuk" />

            <div className="py-6">
                <div className="w-full">
                    <div className="bg-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Tambah Surat Masuk
                            </h1>
                            <p className="text-text-secondary text-sm mt-1">Lengkapi formulir di bawah ini untuk menambahkan surat masuk baru</p>
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
                                                <div className="mt-1">
                                                    <FormDatePicker
                                                        id="tanggal_surat"
                                                        value={data.tanggal_surat}
                                                        onChange={(e) => setData('tanggal_surat', e.target.value)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.tanggal_surat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="asal_surat" value="Asal Surat" required />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="asal_surat"
                                                        options={asalSuratOptions}
                                                        value={asalSuratOptions.some(opt => opt.value === data.asal_surat) ? data.asal_surat : ''}
                                                        customValue={!asalSuratOptions.some(opt => opt.value === data.asal_surat) ? data.asal_surat : ''}
                                                        onChange={(value) => setData('asal_surat', value)}
                                                        onCustomChange={(customValue) => setData('asal_surat', customValue)}
                                                        placeholder="Pilih atau cari asal surat..."
                                                        customPlaceholder="Ketik asal surat lainnya..."
                                                        allowCustom={true}
                                                        error={errors.asal_surat}
                                                    />
                                                </div>
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
                                                <div className="mt-1">
                                                    <TextInput
                                                        id="nomor_surat"
                                                        value={data.nomor_surat}
                                                        onChange={(e) => setData('nomor_surat', e.target.value)}
                                                        placeholder="Masukkan nomor surat"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.nomor_surat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="jenis_surat_id" value="Jenis Surat" required />
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
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="sifat"
                                                        options={sifatSelectOptions}
                                                        value={data.sifat}
                                                        onChange={(value) => setData('sifat', value)}
                                                        placeholder="Pilih atau cari sifat surat..."
                                                        error={errors.sifat}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="lampiran" value="Lampiran" required />
                                                <div className="mt-1">
                                                    <TextInput
                                                        id="lampiran"
                                                        type="number"
                                                        value={data.lampiran}
                                                        onChange={(e) => setData('lampiran', e.target.value)}
                                                        placeholder="Jumlah lampiran"
                                                        min="0"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.lampiran} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="perihal" value="Perihal" required />
                                                <div className="mt-1">
                                                    <FormTextarea
                                                        id="perihal"
                                                        value={data.perihal}
                                                        onChange={(e) => setData('perihal', e.target.value)}
                                                        placeholder="Masukkan perihal surat"
                                                        rows={2}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.perihal} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="isi_ringkas" value="Isi Ringkas Surat" />
                                                <div className="mt-1">
                                                    <FormTextarea
                                                        id="isi_ringkas"
                                                        value={data.isi_ringkas}
                                                        onChange={(e) => setData('isi_ringkas', e.target.value)}
                                                        placeholder="Masukkan ringkasan isi surat"
                                                        rows={4}
                                                        className="w-full"
                                                    />
                                                </div>
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
                                                <div className="mt-1">
                                                    <FormDatePicker
                                                        id="tanggal_diterima"
                                                        value={data.tanggal_diterima}
                                                        onChange={(e) => setData('tanggal_diterima', e.target.value)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.tanggal_diterima} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_agenda" value="No Agenda" required />
                                                <div className="mt-1">
                                                    <TextInput
                                                        id="nomor_agenda"
                                                        value={data.nomor_agenda.split('/')[1] || data.nomor_agenda}
                                                        readOnly
                                                        className="w-full bg-surface-hover cursor-not-allowed"
                                                    />
                                                </div>
                                                <p className="text-xs text-text-secondary mt-1">No agenda digenerate otomatis oleh sistem</p>
                                                <InputError message={errors.nomor_agenda} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="indeks_berkas_id" value="Indeks Surat" required />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="indeks_berkas_id"
                                                        options={indeksBerkasSelectOptions}
                                                        value={data.indeks_berkas_id}
                                                        onChange={handleIndeksBerkasChange}
                                                        placeholder="Pilih atau cari indeks surat..."
                                                        error={errors.indeks_berkas_id}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="kode_klasifikasi_id" value="Kode Klasifikasi" required />
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
                                                <InputLabel htmlFor="staff_pengolah_id" value="Staff Pengolah" required />
                                                <div className="mt-1">
                                                    <FormSearchableSelect
                                                        id="staff_pengolah_id"
                                                        options={staffPengolahOptions}
                                                        value={data.staff_pengolah_id}
                                                        onChange={(value) => setData('staff_pengolah_id', value)}
                                                        placeholder="Pilih atau cari staff pengolah..."
                                                        error={errors.staff_pengolah_id}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="tanggal_diteruskan" value="Tanggal Diteruskan" required />
                                                <div className="mt-1">
                                                    <FormDatePicker
                                                        id="tanggal_diteruskan"
                                                        value={data.tanggal_diteruskan}
                                                        onChange={(e) => setData('tanggal_diteruskan', e.target.value)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.tanggal_diteruskan} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="catatan_tambahan" value="Catatan Tambahan" />
                                                <div className="mt-1">
                                                    <FormTextarea
                                                        id="catatan_tambahan"
                                                        value={data.catatan_tambahan}
                                                        onChange={(e) => setData('catatan_tambahan', e.target.value)}
                                                        placeholder="Masukkan catatan tambahan"
                                                        rows={3}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <InputError message={errors.catatan_tambahan} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel value="Upload File Surat Digital" required />
                                                <div className="mt-1">
                                                    <FormFileUpload
                                                        onChange={(file) => setData('file', file)}
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                                        maxSize={5}
                                                        selectedFile={data.file}
                                                        error={errors.file}
                                                    />
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
                                            {processing ? 'Menyimpan...' : 'Simpan'}
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
