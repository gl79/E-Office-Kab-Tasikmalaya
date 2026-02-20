import { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { formatDateShort } from '@/utils';
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
    TextInput,
    TimeSelect,
} from '@/Components/form';
import { useDeferredDataWithLoading } from '@/hooks';
import wilayahService from '@/services/wilayahService';
import type { PageProps } from '@/types';

interface SuratDetail {
    id: string;
    nomor_agenda: string;
    nomor_surat: string;
    tanggal_surat: string;
    tanggal_surat_formatted: string;
    asal_surat: string;
    jenis_surat?: string | null;
    sifat?: string | null;
    lampiran?: number | null;
    perihal: string;
    isi_ringkas?: string | null;
    tujuan_list: string[];
    tanggal_diterima?: string | null;
    indeks_berkas?: string | null;
    kode_klasifikasi?: string | null;
    staff_pengolah?: string | null;
    tanggal_diteruskan?: string | null;
}

interface JadwalExisting {
    id: string;
    tanggal_agenda: string;
    waktu_mulai: string;
    waktu_selesai: string | null;
    sampai_selesai: boolean;
    lokasi_type: 'dalam_daerah' | 'luar_daerah';
    kode_wilayah: string | null;
    tempat: string;
    keterangan: string | null;
    dihadiri_oleh_user_id: number | null;
}

interface UserOption {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string | null;
    role: string;
}

interface WilayahOption {
    kode: string;
    nama: string;
}

interface Props extends PageProps {
    surat: SuratDetail;
    existingJadwal?: JadwalExisting | null;
    context: {
        can_schedule_by_bupati: boolean;
        can_finalize_delegated: boolean;
        default_dihadiri_oleh_user_id: number;
    };
    users?: UserOption[];
    provinsiOptions?: WilayahOption[];
    kecamatanTasikmalayaOptions?: WilayahOption[];
}

const TASIKMALAYA_PROVINSI = '32';
const TASIKMALAYA_KABUPATEN = '06';

export default function FormPage({
    surat,
    existingJadwal = null,
    context,
    users: initialUsers,
    provinsiOptions: initialProvinsi,
    kecamatanTasikmalayaOptions: initialKecamatanTasik,
}: Props) {
    const { auth } = usePage<PageProps>().props;

    const { data: users, isLoading: usersLoading } = useDeferredDataWithLoading<UserOption[]>(
        `bupati_jadwal_users_${auth.user.id}_${surat.id}`,
        initialUsers
    );
    const { data: provinsiOptions, isLoading: provinsiLoading } = useDeferredDataWithLoading<WilayahOption[]>(
        `bupati_jadwal_provinsi_${auth.user.id}_${surat.id}`,
        initialProvinsi
    );
    const { data: kecamatanTasikOptions, isLoading: kecamatanLoading } = useDeferredDataWithLoading<WilayahOption[]>(
        `bupati_jadwal_kecamatan_${auth.user.id}_${surat.id}`,
        initialKecamatanTasik
    );

    const [kabupatenOptions, setKabupatenOptions] = useState<WilayahOption[]>([]);
    const [desaOptions, setDesaOptions] = useState<WilayahOption[]>([]);

    const parsedKodeWilayah = useMemo(() => {
        if (!existingJadwal?.kode_wilayah) {
            return null;
        }

        const parts = existingJadwal.kode_wilayah.split('.');
        if (parts.length !== 4) {
            return null;
        }

        return {
            provinsi: parts[0],
            kabupaten: parts[1],
            kecamatan: parts[2],
            desa: parts[3],
        };
    }, [existingJadwal?.kode_wilayah]);

    const form = useForm({
        dihadiri_oleh_user_id: String(
            existingJadwal?.dihadiri_oleh_user_id ?? context.default_dihadiri_oleh_user_id
        ),
        tanggal_agenda: existingJadwal?.tanggal_agenda ?? '',
        waktu_mulai: existingJadwal?.waktu_mulai ?? '',
        waktu_selesai: existingJadwal?.waktu_selesai ?? '',
        sampai_selesai: existingJadwal?.sampai_selesai ?? false,
        lokasi_type: existingJadwal?.lokasi_type ?? 'dalam_daerah',
        provinsi_id: parsedKodeWilayah?.provinsi ?? '',
        kabupaten_id: parsedKodeWilayah?.kabupaten ?? '',
        kecamatan_id: parsedKodeWilayah?.kecamatan ?? '',
        desa_id: parsedKodeWilayah?.desa ?? '',
        tempat: existingJadwal?.tempat ?? '',
        keterangan: existingJadwal?.keterangan ?? '',
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

    const loadingDeferred = usersLoading || provinsiLoading || kecamatanLoading;

    const userSelectOptions = (users ?? []).map((item) => ({
        value: String(item.id),
        label: item.jabatan
            ? `${item.name} - ${item.jabatan}${item.nip ? ` (${item.nip})` : ''}`
            : `${item.name}${item.nip ? ` (${item.nip})` : ''}`,
    }));
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

        if (existingJadwal) {
            form.put(route('bupati.jadwal.update', surat.id));
            return;
        }

        form.post(route('bupati.jadwal.store', surat.id));
    };

    return (
        <>
            <Head title="Jadwal Tentative" />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Form Jadwal Tentative</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        {context.can_finalize_delegated
                            ? 'Finalisasi jadwal surat yang didelegasikan kepada Anda.'
                            : 'Penjadwalan surat masuk untuk tindak lanjut pimpinan.'}
                    </p>
                </div>
                <Link href={route('persuratan.surat-masuk.index')}>
                    <Button variant="secondary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </div>

            <div className="rounded-lg border border-border-default bg-surface p-4 sm:p-6">
                <div className="mb-6 rounded-lg border border-border-default bg-surface-hover p-4">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">Ringkasan Surat</h3>

                    {/* Identitas Surat */}
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Identitas Surat</p>
                    <div className="grid grid-cols-1 gap-2 text-sm text-text-primary sm:grid-cols-2 mb-4">
                        <div>
                            <span className="text-text-secondary">Tanggal Surat:</span>
                            <span className="ml-2 font-medium">{surat.tanggal_surat_formatted}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary">Asal Surat:</span>
                            <span className="ml-2 font-medium">{surat.asal_surat}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary">No Surat:</span>
                            <span className="ml-2 font-medium">{surat.nomor_surat}</span>
                        </div>
                        {surat.jenis_surat && (
                            <div>
                                <span className="text-text-secondary">Jenis Surat:</span>
                                <span className="ml-2 font-medium">{surat.jenis_surat}</span>
                            </div>
                        )}
                        {surat.sifat && (
                            <div>
                                <span className="text-text-secondary">Sifat Surat:</span>
                                <span className="ml-2 font-medium capitalize">{surat.sifat.replace('_', ' ')}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-text-secondary">Lampiran:</span>
                            <span className="ml-2 font-medium">{surat.lampiran ?? 0} berkas</span>
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-text-secondary">Perihal:</span>
                            <span className="ml-2 font-medium">{surat.perihal}</span>
                        </div>
                        {surat.tujuan_list.length > 0 && (
                            <div className="sm:col-span-2">
                                <span className="text-text-secondary">Kepada:</span>
                                <span className="ml-2 font-medium">{surat.tujuan_list.join(', ')}</span>
                            </div>
                        )}
                        {surat.isi_ringkas && (
                            <div className="sm:col-span-2">
                                <span className="text-text-secondary">Isi Ringkas:</span>
                                <span className="ml-2 font-medium">{surat.isi_ringkas}</span>
                            </div>
                        )}
                    </div>

                    {/* Identitas Agenda */}
                    <div className="border-t border-border-default pt-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Identitas Agenda</p>
                        <div className="grid grid-cols-1 gap-2 text-sm text-text-primary sm:grid-cols-2">
                            {surat.tanggal_diterima && (
                                <div>
                                    <span className="text-text-secondary">Tanggal Diterima:</span>
                                    <span className="ml-2 font-medium">{formatDateShort(surat.tanggal_diterima)}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-text-secondary">No Agenda:</span>
                                <span className="ml-2 font-medium">
                                    {surat.nomor_agenda.split('/')[1] || surat.nomor_agenda}
                                </span>
                            </div>
                            {surat.indeks_berkas && (
                                <div>
                                    <span className="text-text-secondary">Indeks Surat:</span>
                                    <span className="ml-2 font-medium">{surat.indeks_berkas}</span>
                                </div>
                            )}
                            {surat.kode_klasifikasi && (
                                <div>
                                    <span className="text-text-secondary">Kode Klasifikasi:</span>
                                    <span className="ml-2 font-medium">{surat.kode_klasifikasi}</span>
                                </div>
                            )}
                            {surat.staff_pengolah && (
                                <div>
                                    <span className="text-text-secondary">Staff Pengolah:</span>
                                    <span className="ml-2 font-medium">{surat.staff_pengolah}</span>
                                </div>
                            )}
                            {surat.tanggal_diteruskan && (
                                <div>
                                    <span className="text-text-secondary">Tanggal Diteruskan:</span>
                                    <span className="ml-2 font-medium">{formatDateShort(surat.tanggal_diteruskan)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                        <div>
                            <InputLabel htmlFor="dihadiri_oleh_user_id" value="Dihadiri Oleh" required />
                            <FormSelect
                                id="dihadiri_oleh_user_id"
                                options={userSelectOptions}
                                value={form.data.dihadiri_oleh_user_id}
                                onChange={(e) => form.setData('dihadiri_oleh_user_id', e.target.value)}
                                className="mt-1 w-full"
                                placeholder="Pilih pengguna"
                            />
                            <InputError message={form.errors.dihadiri_oleh_user_id} className="mt-1" />
                        </div>

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

                        {form.data.lokasi_type === 'dalam_daerah' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            </div>
                        )}

                        {form.data.lokasi_type === 'luar_daerah' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="tempat" value="Tempat (Alamat Lengkap)" required />
                            <TextInput
                                id="tempat"
                                value={form.data.tempat}
                                onChange={(e) => form.setData('tempat', e.target.value)}
                                className="mt-1 w-full"
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

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={form.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'Menyimpan...' : existingJadwal ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

FormPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
