import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import InputLabel from '@/Components/form/InputLabel';
import InputError from '@/Components/form/InputError';
import TextInput from '@/Components/form/TextInput';
import FormSelect from '@/Components/form/FormSelect';
import FormTextarea from '@/Components/form/FormTextarea';
import FormDatePicker from '@/Components/form/FormDatePicker';

interface UserOption {
    id: number;
    name: string;
    nip?: string | null;
    jabatan?: string | null;
}

interface CutiFormData {
    user_id: string;
    atasan_id: string;
    jenis_cuti: string;
    alasan_cuti: string;
    lama_cuti: string | number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alamat_cuti: string;
}

interface CutiFormProps {
    title: string;
    description?: string;
    users: UserOption[];
    jenisCutiOptions: string[];
    data: CutiFormData;
    setData: (key: keyof CutiFormData, value: string | number) => void;
    errors: Partial<Record<keyof CutiFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    cancelHref: string;
}

export default function CutiForm({
    title,
    description,
    users,
    jenisCutiOptions,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    cancelHref,
}: CutiFormProps) {
    const userOptions = users.map((user) => ({
        value: user.id.toString(),
        label: user.nip ? `${user.name} (${user.nip})` : user.name,
    }));

    const jenisOptions = jenisCutiOptions.map((jenis) => ({
        value: jenis,
        label: jenis,
    }));

    const selectedPegawai = users.find((user) => user.id.toString() === data.user_id);
    const selectedAtasan = users.find((user) => user.id.toString() === data.atasan_id);

    return (
        <div className="bg-surface border border-border-default rounded-lg p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                {description && (
                    <p className="text-text-secondary text-sm mt-1">{description}</p>
                )}
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pegawai & Atasan */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-text-primary">Informasi Pegawai</h2>
                        </div>

                        <div>
                            <InputLabel htmlFor="user_id" value="Pegawai *" />
                            <FormSelect
                                id="user_id"
                                options={userOptions}
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                placeholder="Pilih pegawai"
                                className="w-full mt-1"
                            />
                            <InputError message={errors.user_id} className="mt-1" />
                            {selectedPegawai && (
                                <div className="mt-2 text-xs text-text-secondary">
                                    <div>NIP: {selectedPegawai.nip || '-'}</div>
                                    <div>Jabatan: {selectedPegawai.jabatan || '-'}</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="atasan_id" value="Atasan Langsung" />
                            <FormSelect
                                id="atasan_id"
                                options={userOptions}
                                value={data.atasan_id}
                                onChange={(e) => setData('atasan_id', e.target.value)}
                                placeholder="Pilih atasan"
                                className="w-full mt-1"
                            />
                            <InputError message={errors.atasan_id} className="mt-1" />
                            {selectedAtasan && (
                                <div className="mt-2 text-xs text-text-secondary">
                                    <div>NIP: {selectedAtasan.nip || '-'}</div>
                                    <div>Jabatan: {selectedAtasan.jabatan || '-'}</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="jenis_cuti" value="Jenis Cuti *" />
                            <FormSelect
                                id="jenis_cuti"
                                options={jenisOptions}
                                value={data.jenis_cuti}
                                onChange={(e) => setData('jenis_cuti', e.target.value)}
                                placeholder="Pilih jenis cuti"
                                className="w-full mt-1"
                            />
                            <InputError message={errors.jenis_cuti} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="alasan_cuti" value="Alasan Cuti *" />
                            <FormTextarea
                                id="alasan_cuti"
                                value={data.alasan_cuti}
                                onChange={(e) => setData('alasan_cuti', e.target.value)}
                                placeholder="Jelaskan alasan pengajuan cuti"
                                rows={4}
                                className="w-full mt-1"
                            />
                            <InputError message={errors.alasan_cuti} className="mt-1" />
                        </div>
                    </div>

                    {/* Detail Cuti */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-success-light text-success flex items-center justify-center">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-semibold text-text-primary">Durasi & Lokasi</h2>
                        </div>

                        <div>
                            <InputLabel htmlFor="lama_cuti" value="Lama Cuti (Hari Kerja) *" />
                            <TextInput
                                id="lama_cuti"
                                type="number"
                                min="1"
                                value={data.lama_cuti}
                                onChange={(e) => setData('lama_cuti', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Contoh: 3"
                            />
                            <InputError message={errors.lama_cuti} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="tanggal_mulai" value="Mulai Tanggal *" />
                                <FormDatePicker
                                    id="tanggal_mulai"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    className="w-full mt-1"
                                />
                                <InputError message={errors.tanggal_mulai} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tanggal_selesai" value="Sampai Tanggal *" />
                                <FormDatePicker
                                    id="tanggal_selesai"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    className="w-full mt-1"
                                />
                                <InputError message={errors.tanggal_selesai} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="alamat_cuti" value="Alamat Selama Cuti *" />
                            <FormTextarea
                                id="alamat_cuti"
                                value={data.alamat_cuti}
                                onChange={(e) => setData('alamat_cuti', e.target.value)}
                                placeholder="Alamat lengkap selama menjalankan cuti"
                                rows={4}
                                className="w-full mt-1"
                            />
                            <InputError message={errors.alamat_cuti} className="mt-1" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 border-t border-border-default pt-4">
                    <Link href={cancelHref}>
                        <Button type="button" variant="secondary" className="w-full sm:w-auto">
                            Batal
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
