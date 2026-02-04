import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/ui/Button';
import FormWizard from '@/Components/form/FormWizard';
import TextInput from '@/Components/form/TextInput';
import FormTextarea from '@/Components/form/FormTextarea';
import FormSelect from '@/Components/form/FormSelect';
import FormDatePicker from '@/Components/form/FormDatePicker';
import FormMultiSelect from '@/Components/form/FormMultiSelect';
import FormFileUpload from '@/Components/form/FormFileUpload';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import type { PageProps } from '@/types';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
}

interface User {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string | null;
}

interface Props extends PageProps {
    indeksSurat: IndeksSurat[];
    users: User[];
    sifatOptions: Record<string, string>;
    tujuanOptions: string[];
}

export default function Create({ indeksSurat, users, sifatOptions, tujuanOptions }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepError, setStepError] = useState('');

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        // Step 1: Identitas Surat
        tanggal_surat: '',
        asal_surat: '',
        tujuan: [] as string[],
        nomor_surat: '',
        sifat: '',
        lampiran: '',
        perihal: '',
        isi_ringkas: '',
        // Step 2: Identitas Agenda
        tanggal_diterima: '',
        nomor_agenda: '',
        indeks_berkas_id: '',
        kode_klasifikasi_id: '',
        staff_pengolah_id: '',
        tanggal_diteruskan: '',
        catatan_tambahan: '',
        file: null as File | null,
    });

    const steps = [
        { title: 'Identitas Surat', description: 'Data surat' },
        { title: 'Identitas Agenda', description: 'Data agenda & file' },
    ];

    const indeksOptions = indeksSurat.map((item) => ({
        value: item.id,
        label: `${item.kode} - ${item.nama}`,
    }));

    const userOptions = users.map((user) => ({
        value: user.id.toString(),
        label: user.nip ? `${user.name} (${user.nip})` : user.name,
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

        post(route('persuratan.surat-masuk.store'), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Tambah Surat Masuk" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <Link href={route('persuratan.surat-masuk.index')}>
                                <Button variant="secondary" size="sm">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Tambah Surat Masuk
                            </h1>
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
                                                <InputLabel htmlFor="tanggal_surat" value="Tanggal Surat *" />
                                                <FormDatePicker
                                                    id="tanggal_surat"
                                                    value={data.tanggal_surat}
                                                    onChange={(e) => setData('tanggal_surat', e.target.value)}
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.tanggal_surat} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_surat" value="Nomor Surat *" />
                                                <TextInput
                                                    id="nomor_surat"
                                                    value={data.nomor_surat}
                                                    onChange={(e) => setData('nomor_surat', e.target.value)}
                                                    placeholder="Masukkan nomor surat"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.nomor_surat} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="asal_surat" value="Asal Surat *" />
                                                <TextInput
                                                    id="asal_surat"
                                                    value={data.asal_surat}
                                                    onChange={(e) => setData('asal_surat', e.target.value)}
                                                    placeholder="Masukkan asal surat"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.asal_surat} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel value="Kepada (Tujuan Surat) *" />
                                                <FormMultiSelect
                                                    options={tujuanOptions}
                                                    value={data.tujuan}
                                                    onChange={(value) => setData('tujuan', value)}
                                                    placeholder="Pilih tujuan surat..."
                                                    allowCustom={true}
                                                    customPlaceholder="Tambah tujuan lainnya..."
                                                    error={errors.tujuan}
                                                />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="sifat" value="Sifat Surat *" />
                                                <FormSelect
                                                    id="sifat"
                                                    options={sifatSelectOptions}
                                                    value={data.sifat}
                                                    onChange={(e) => setData('sifat', e.target.value)}
                                                    placeholder="Pilih sifat surat"
                                                    className="w-full mt-1"
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
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.lampiran} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="perihal" value="Perihal *" />
                                                <FormTextarea
                                                    id="perihal"
                                                    value={data.perihal}
                                                    onChange={(e) => setData('perihal', e.target.value)}
                                                    placeholder="Masukkan perihal surat"
                                                    rows={2}
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.perihal} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="isi_ringkas" value="Isi Ringkas Surat *" />
                                                <FormTextarea
                                                    id="isi_ringkas"
                                                    value={data.isi_ringkas}
                                                    onChange={(e) => setData('isi_ringkas', e.target.value)}
                                                    placeholder="Masukkan ringkasan isi surat"
                                                    rows={4}
                                                    className="w-full mt-1"
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
                                                <InputLabel htmlFor="tanggal_diterima" value="Tanggal Diterima *" />
                                                <FormDatePicker
                                                    id="tanggal_diterima"
                                                    value={data.tanggal_diterima}
                                                    onChange={(e) => setData('tanggal_diterima', e.target.value)}
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.tanggal_diterima} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="nomor_agenda" value="Nomor Agenda *" />
                                                <TextInput
                                                    id="nomor_agenda"
                                                    value={data.nomor_agenda}
                                                    onChange={(e) => setData('nomor_agenda', e.target.value)}
                                                    placeholder="Contoh: 0001"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.nomor_agenda} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="indeks_berkas_id" value="Indeks Berkas" />
                                                <FormSelect
                                                    id="indeks_berkas_id"
                                                    options={indeksOptions}
                                                    value={data.indeks_berkas_id}
                                                    onChange={(e) => setData('indeks_berkas_id', e.target.value)}
                                                    placeholder="Pilih indeks berkas"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.indeks_berkas_id} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="kode_klasifikasi_id" value="Kode Klasifikasi" />
                                                <FormSelect
                                                    id="kode_klasifikasi_id"
                                                    options={indeksOptions}
                                                    value={data.kode_klasifikasi_id}
                                                    onChange={(e) => setData('kode_klasifikasi_id', e.target.value)}
                                                    placeholder="Pilih kode klasifikasi"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.kode_klasifikasi_id} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="staff_pengolah_id" value="Staff Pengolah" />
                                                <FormSelect
                                                    id="staff_pengolah_id"
                                                    options={userOptions}
                                                    value={data.staff_pengolah_id}
                                                    onChange={(e) => setData('staff_pengolah_id', e.target.value)}
                                                    placeholder="Pilih staff pengolah"
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.staff_pengolah_id} className="mt-1" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="tanggal_diteruskan" value="Tanggal Diteruskan" />
                                                <FormDatePicker
                                                    id="tanggal_diteruskan"
                                                    value={data.tanggal_diteruskan}
                                                    onChange={(e) => setData('tanggal_diteruskan', e.target.value)}
                                                    className="w-full mt-1"
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
                                                    className="w-full mt-1"
                                                />
                                                <InputError message={errors.catatan_tambahan} className="mt-1" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <InputLabel value="Upload File Surat Digital *" />
                                                <FormFileUpload
                                                    onChange={(file) => setData('file', file)}
                                                    accept=".pdf,.doc,.docx"
                                                    maxSize={5}
                                                    error={errors.file}
                                                />
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
