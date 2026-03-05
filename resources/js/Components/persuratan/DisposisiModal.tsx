import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Modal, Button } from '@/Components/ui';
import FormSelect from '@/Components/form/FormSelect';
import axios from 'axios';
import type { DisposisiTarget } from '@/types/persuratan';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suratMasukId: string | null;
    suratPerihal?: string;
    onSuccess?: () => void;
}

/**
 * Modal untuk mendisposisi surat masuk ke pejabat bawahan.
 */
export default function DisposisiModal({ isOpen, onClose, suratMasukId, suratPerihal, onSuccess }: Props) {
    const [targets, setTargets] = useState<DisposisiTarget[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('');
    const [catatan, setCatatan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchTargets = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(route('persuratan.surat-masuk.disposisi-targets'));
            setTargets(data.targets ?? []);
        } catch {
            setTargets([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchTargets();
            setSelectedTarget('');
            setCatatan('');
            setError('');
        }
    }, [isOpen, fetchTargets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTarget) {
            setError('Pilih penerima disposisi.');
            return;
        }

        if (!suratMasukId) return;

        setIsSubmitting(true);
        setError('');

        router.post(route('persuratan.surat-masuk.disposisi', suratMasukId), {
            ke_user_id: parseInt(selectedTarget, 10),
            catatan: catatan || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                onSuccess?.();
            },
            onError: (errors) => {
                setError(Object.values(errors).flat().join(', '));
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const targetOptions = targets.map(t => ({
        value: String(t.id),
        label: `${t.name} — ${t.jabatan}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Disposisi Surat" size="md">
            {suratPerihal && (
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                    Perihal: <strong>{suratPerihal}</strong>
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Disposisi Ke <span className="text-danger">*</span>
                    </label>
                    {isLoading ? (
                        <div className="h-10 bg-border-light rounded animate-pulse" />
                    ) : (
                        <FormSelect
                            options={targetOptions}
                            value={selectedTarget}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setSelectedTarget(e.target.value);
                                setError('');
                            }}
                            placeholder="Pilih penerima disposisi..."
                            className="w-full"
                        />
                    )}
                    <p className="text-xs text-text-muted mt-1">
                        Hanya pejabat dengan level di bawah Anda yang tersedia.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                        Catatan / Instruksi
                    </label>
                    <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Catatan disposisi (opsional)..."
                        rows={3}
                        maxLength={2000}
                        className="w-full rounded-md border-border-default bg-surface focus:border-primary focus:ring-primary text-sm"
                    />
                </div>

                {error && (
                    <p className="text-sm text-danger">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedTarget}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Disposisi'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
