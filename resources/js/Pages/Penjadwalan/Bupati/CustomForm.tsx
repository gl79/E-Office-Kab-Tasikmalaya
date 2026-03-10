import { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui';
import {
    Checkbox,
    FormDatePicker,
    FormSelect,
    FormTextarea,
    InputError,
    InputLabel,
    TimeSelect,
} from '@/Components/form';
import { useDeferredDataWithLoading } from '@/hooks';
import wilayahService from '@/services/wilayahService';
import type { PageProps } from '@/types';

interface WilayahOption {
    kode: string;
    nama: string;
}

interface Props extends PageProps {
    provinsiOptions?: WilayahOption[];
    kecamatanTasikmalayaOptions?: WilayahOption[];
}

const TASIKMALAYA_PROVINSI = '32';
const TASIKMALAYA_KABUPATEN = '06';

export default function CustomForm({
    provinsiOptions: initialProvinsi,
    kecamatanTasikmalayaOptions: initialKecamatanTasik,
}: Props) {
    const { auth } = usePage<PageProps>().props;

    const { data: provinsiOptions, isLoading: provinsiLoading } = useDeferredDataWithLoading<WilayahOption[]>(
        `bupati_jadwal_custom_provinsi_${auth.user.id}`,
        initialProvinsi
    );
    const { data: kecamatanTasikOptions, isLoading: kecamatanLoading } = useDeferredDataWithLoading<WilayahOption[]>(
        `bupati_jadwal_custom_kecamatan_${auth.user.id}`,
        initialKecamatanTasik
    );

    const [kabupatenOptions, setKabupatenOptions] = useState<WilayahOption[]>([]);
    const [desaOptions, setDesaOptions] = useState<WilayahOption[]>([]);

    const form = useForm({
        nama_kegiatan: '',
        tanggal_agenda: '',
        waktu_mulai: '',
        waktu_selesai: '',
        sampai_selesai: false,
        lokasi_type: 'dalam_daerah' as 'dalam_daerah' | 'luar_daerah',
        provinsi_id: '',
        kabupaten_id: '',
        kecamatan_id: '',
        desa_id: '',
        tempat: '',
        keterangan: '',
        file: null as File | null,
    });

    useEffect(() => {
        if (form.data.lokasi_type === 'dalam_daerah') {
            form.setData('provinsi_id', TASIKMALAYA_PROVINSI);
            form.setData('kabupaten_id', TASIKMALAYA_KABUPATEN);
            return;
        }

        if (form.data.provinsi_id === TASIKMALAYA_PROVINSI && form.data.kabupaten_id === TASIKMALAYA_KABUPATEN) {
            form.setData('provinsi_id', '');
            form.setData('kabupaten_id', '');
        }
    }, [form.data.lokasi_type]);

    useEffect(() => {
        if (form.data.lokasi_type !== 'luar_daerah' || !form.data.provinsi_id) {
            setKabupatenOptions([]);
            return;
        }

        wilayahService.getKabupatenByProvinsi(form.data.provinsi_id)
            .then((response) => setKabupatenOptions(response.data))
            .catch(() => setKabupatenOptions([]));
    }, [form.data.lokasi_type, form.data.provinsi_id]);

    useEffect(() => {
        if (form.data.lokasi_type !== 'dalam_daerah' || !form.data.kecamatan_id) {
            setDesaOptions([]);
            return;
        }

        wilayahService
            .getDesaByKecamatan(TASIKMALAYA_PROVINSI, TASIKMALAYA_KABUPATEN, form.data.kecamatan_id)
            .then((response) => setDesaOptions(response.data))
            .catch(() => setDesaOptions([]));
    }, [form.data.lokasi_type, form.data.kecamatan_id]);

    const loadingDeferred = provinsiLoading || kecamatanLoading;

    const provinsiSelectOptions = (provinsiOptions ?? []).map((item) => ({
        value: item.kode,
        label: item.nama,
    }));
    const kabupatenSelectOptions = kabupatenOptions.map((item) => ({
        value: item.kode,
        label: item.nama,
    }));
    const kecamatanSelectOptions = (kecamatanTasikOptions ?? []).map((item) => ({
        value: item.kode,
        label: item.nama,
    }));
    const desaSelectOptions = desaOptions.map((item) => ({
        value: item.kode,
        label: item.nama,
    }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('bupati.jadwal.custom.store'));
    };

    return (
        <>
            <Head title="Jadwal Custom" />

            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Jadwal Custom</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Buat jadwal kegiatan yang tidak berasal dari surat masuk. Jadwal akan langsung berstatus definitif.
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-border-default bg-surface p-4 sm:p-6">
                {loadingDeferred ? (
                    <div className="space-y-3">
                        <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
                            <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
                        </div>
                        <div className="h-32 animate-pulse rounded-md bg-surface-hover" />
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-5">
                        {/* Nama Kegiatan */}
                        <div>
                            <InputLabel htmlFor="nama_kegiatan" value="Nama Kegiatan" required />
                            <FormTextarea
                                id="nama_kegiatan"
                                value={form.data.nama_kegiatan}
                                onChange={(e) => form.setData('nama_kegiatan', e.target.value)}
                                className="mt-1 w-full"
                                placeholder="Contoh: Undangan Pernikahan, Rapat Koordinasi, dll."
                                rows={3}
                            />
                            <InputError message={form.errors.nama_kegiatan} className="mt-1" />
                        </div>

                        {/* Tanggal & Waktu */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <InputLabel htmlFor="tanggal_agenda" value="Tanggal" required />
                                <FormDatePicker
                                    id="tanggal_agenda"
                                    value={form.data.tanggal_agenda}
                                    onChange={(e) => form.setData('tanggal_agenda', e.target.value)}
                                    className="mt-1 w-full"
                                />
                                <InputError message={form.errors.tanggal_agenda} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="waktu_mulai" value="Waktu Mulai" required />
                                <TimeSelect
                                    id="waktu_mulai"
                                    value={form.data.waktu_mulai}
                                    onChange={(e) => form.setData('waktu_mulai', e.target.value)}
                                    className="mt-1 w-full"
                                    placeholder="Pilih waktu mulai"
                                />
                                <InputError message={form.errors.waktu_mulai} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="waktu_selesai" value="Waktu Selesai" />
                                <TimeSelect
                                    id="waktu_selesai"
                                    value={form.data.waktu_selesai}
                                    onChange={(e) => form.setData('waktu_selesai', e.target.value)}
                                    className="mt-1 w-full"
                                    disabled={form.data.sampai_selesai}
                                    placeholder="Pilih waktu selesai"
                                />
                                <InputError message={form.errors.waktu_selesai} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <label className="inline-flex items-center">
                                <Checkbox
                                    checked={form.data.sampai_selesai}
                                    onChange={(e) => {
                                        form.setData('sampai_selesai', e.target.checked);
                                        if (e.target.checked) {
                                            form.setData('waktu_selesai', '');
                                        }
                                    }}
                                />
                                <span className="ml-2 text-sm text-text-secondary">Sampai Selesai</span>
                            </label>
                        </div>

                        {/* Lokasi */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <InputLabel htmlFor="lokasi_type" value="Tipe Lokasi" required />
                                <FormSelect
                                    id="lokasi_type"
                                    options={[
                                        { value: 'dalam_daerah', label: 'Dalam Daerah' },
                                        { value: 'luar_daerah', label: 'Luar Daerah' },
                                    ]}
                                    value={form.data.lokasi_type}
                                    onChange={(e) => {
                                        form.setData('lokasi_type', e.target.value as 'dalam_daerah' | 'luar_daerah');
                                        form.setData('provinsi_id', '');
                                        form.setData('kabupaten_id', '');
                                        form.setData('kecamatan_id', '');
                                        form.setData('desa_id', '');
                                    }}
                                    className="mt-1 w-full"
                                />
                                <InputError message={form.errors.lokasi_type} className="mt-1" />
                            </div>
                            {form.data.lokasi_type === 'dalam_daerah' ? (
                                <>
                                    <div>
                                        <InputLabel htmlFor="kecamatan_id" value="Kecamatan" required />
                                        <FormSelect
                                            id="kecamatan_id"
                                            options={kecamatanSelectOptions}
                                            value={form.data.kecamatan_id}
                                            onChange={(e) => {
                                                form.setData('kecamatan_id', e.target.value);
                                                form.setData('desa_id', '');
                                            }}
                                            className="mt-1 w-full"
                                            placeholder="Pilih kecamatan"
                                        />
                                        <InputError message={form.errors.kecamatan_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="desa_id" value="Desa" required />
                                        <FormSelect
                                            id="desa_id"
                                            options={desaSelectOptions}
                                            value={form.data.desa_id}
                                            onChange={(e) => form.setData('desa_id', e.target.value)}
                                            className="mt-1 w-full"
                                            placeholder="Pilih desa"
                                            disabled={!form.data.kecamatan_id}
                                        />
                                        <InputError message={form.errors.desa_id} className="mt-1" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <InputLabel htmlFor="provinsi_id" value="Provinsi" required />
                                        <FormSelect
                                            id="provinsi_id"
                                            options={provinsiSelectOptions}
                                            value={form.data.provinsi_id}
                                            onChange={(e) => {
                                                form.setData('provinsi_id', e.target.value);
                                                form.setData('kabupaten_id', '');
                                            }}
                                            className="mt-1 w-full"
                                            placeholder="Pilih provinsi"
                                        />
                                        <InputError message={form.errors.provinsi_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="kabupaten_id" value="Kabupaten" required />
                                        <FormSelect
                                            id="kabupaten_id"
                                            options={kabupatenSelectOptions}
                                            value={form.data.kabupaten_id}
                                            onChange={(e) => form.setData('kabupaten_id', e.target.value)}
                                            className="mt-1 w-full"
                                            placeholder="Pilih kabupaten"
                                            disabled={!form.data.provinsi_id}
                                        />
                                        <InputError message={form.errors.kabupaten_id} className="mt-1" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="tempat" value="Tempat (Alamat Lengkap)" required />
                            <FormTextarea
                                id="tempat"
                                value={form.data.tempat}
                                onChange={(e) => form.setData('tempat', e.target.value)}
                                className="mt-1 w-full"
                                rows={2}
                                placeholder="Contoh: Pendopo Kabupaten Tasikmalaya"
                            />
                            <InputError message={form.errors.tempat} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="keterangan" value="Keterangan" />
                            <FormTextarea
                                id="keterangan"
                                value={form.data.keterangan}
                                onChange={(e) => form.setData('keterangan', e.target.value)}
                                className="mt-1 w-full"
                                rows={4}
                                placeholder="Catatan tambahan (opsional)"
                            />
                            <InputError message={form.errors.keterangan} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file" value="File Lampiran (Opsional)" />
                            <input
                                id="file"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        form.setData('file', e.target.files[0]);
                                    } else {
                                        form.setData('file', null);
                                    }
                                }}
                                className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-border-default rounded-md bg-surface p-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-text-muted">
                                Format: PDF, DOC, DOCX, JPG, PNG. Maksimal 5MB.
                            </p>
                            <InputError message={form.errors.file} className="mt-1" />
                        </div>

                        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                            <Link href={route('penjadwalan.definitif.index')}>
                                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                            <Button type="submit" disabled={form.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

CustomForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
