import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Modal, Button } from '@/Components/ui';
import { TextInput } from '@/Components/form';
import FormDatePicker from '@/Components/form/FormDatePicker';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suratMasukId: string | null;
    suratPerihal?: string;
    onSuccess?: () => void;
}

/**
 * Modal untuk menjadwalkan surat masuk sebagai kegiatan tentatif.
 */
export default function JadwalkanModal({ isOpen, onClose, suratMasukId, suratPerihal, onSuccess }: Props) {
    const [form, setForm] = useState({
        judul_kegiatan: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        sampai_selesai: false,
        lokasi: '',
        lokasi_type: 'dalam_daerah',
        keterangan: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setForm({
                judul_kegiatan: suratPerihal ?? '',
                tanggal: '',
                waktu_mulai: '',
                waktu_selesai: '',
                sampai_selesai: false,
                lokasi: '',
                lokasi_type: 'dalam_daerah',
                keterangan: '',
            });
            setErrors({});
        }
    }, [isOpen, suratPerihal]);

    const handleChange = (field: string, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!suratMasukId) return;

        setIsSubmitting(true);
        setErrors({});

        router.post(route('persuratan.surat-masuk.jadwalkan', suratMasukId), {
            ...form,
            sampai_selesai: form.sampai_selesai ? 1 : 0,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                onSuccess?.();
            },
            onError: (errs) => {
                const mapped: Record<string, string> = {};
                for (const [k, v] of Object.entries(errs)) {
                    mapped[k] = Array.isArray(v) ? v[0] : String(v);
                }
                setErrors(mapped);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Jadwalkan Kegiatan" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Judul Kegiatan <span className="text-danger">*</span>
                    </label>
                    <TextInput
                        value={form.judul_kegiatan}
                        onChange={(e) => handleChange('judul_kegiatan', e.target.value)}
                        placeholder="Judul kegiatan..."
                        className="w-full"
                    />
                    {errors.judul_kegiatan && <p className="text-xs text-danger mt-1">{errors.judul_kegiatan}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Tanggal <span className="text-danger">*</span>
                        </label>
                        <FormDatePicker
                            value={form.tanggal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tanggal', e.target.value)}
                            className="w-full"
                        />
                        {errors.tanggal && <p className="text-xs text-danger mt-1">{errors.tanggal}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Lokasi <span className="text-danger">*</span>
                        </label>
                        <TextInput
                            value={form.lokasi}
                            onChange={(e) => handleChange('lokasi', e.target.value)}
                            placeholder="Nama tempat / lokasi..."
                            className="w-full"
                        />
                        {errors.lokasi && <p className="text-xs text-danger mt-1">{errors.lokasi}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Waktu Mulai <span className="text-danger">*</span>
                        </label>
                        <input
                            type="time"
                            value={form.waktu_mulai}
                            onChange={(e) => handleChange('waktu_mulai', e.target.value)}
                            className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary text-sm"
                        />
                        {errors.waktu_mulai && <p className="text-xs text-danger mt-1">{errors.waktu_mulai}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Waktu Selesai
                        </label>
                        <input
                            type="time"
                            value={form.waktu_selesai}
                            onChange={(e) => handleChange('waktu_selesai', e.target.value)}
                            disabled={form.sampai_selesai}
                            className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary text-sm disabled:opacity-50"
                        />
                        {errors.waktu_selesai && <p className="text-xs text-danger mt-1">{errors.waktu_selesai}</p>}
                    </div>

                    <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.sampai_selesai}
                                onChange={(e) => {
                                    handleChange('sampai_selesai', e.target.checked);
                                    if (e.target.checked) handleChange('waktu_selesai', '');
                                }}
                                className="rounded border-border-default text-primary focus:ring-primary"
                            />
                            Sampai Selesai
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Keterangan
                    </label>
                    <textarea
                        value={form.keterangan}
                        onChange={(e) => handleChange('keterangan', e.target.value)}
                        placeholder="Keterangan tambahan (opsional)..."
                        rows={3}
                        maxLength={2000}
                        className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Jadwalkan (Tentatif)'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
