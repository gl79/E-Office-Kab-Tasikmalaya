import React from 'react';
import { Modal, Button } from '@/Components/ui';
import { TextInput, InputLabel, InputError, FormSelect, FormTextarea } from '@/Components/form';
import type { Agenda } from '@/types/penjadwalan';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedAgenda: Agenda | null;
    form: any; // Inertia useForm object
    disposisiSelectOptions: { value: string; label: string }[];
}

const TentatifEditModal: React.FC<Props> = ({ isOpen, onClose, selectedAgenda, form, disposisiSelectOptions }) => {
    const { data, setData, processing, errors, submitHandler } = form; // Assuming submitHandler is passed attached to form

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Kehadiran"
            size="md"
        >
            {selectedAgenda && (
                <form onSubmit={submitHandler}>
                    {/* Informasi Jadwal */}
                    <div className="mb-6 p-4 bg-surface-hover rounded-lg border border-border-default">
                        <h4 className="text-sm font-medium text-text-primary mb-3">Informasi Jadwal</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-text-secondary">Kegiatan:</span>
                                <span className="ml-2 font-medium text-text-primary">{selectedAgenda.nama_kegiatan}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-text-secondary">Tanggal:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedAgenda.tanggal_format_indonesia}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Waktu:</span>
                                    <span className="ml-2 font-medium text-text-primary">{selectedAgenda.waktu_lengkap}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-text-secondary">Tempat:</span>
                                <span className="ml-2 font-medium text-text-primary">{selectedAgenda.tempat}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Status Disposisi */}
                        <div>
                            <InputLabel htmlFor="status_disposisi" value="Status Disposisi *" />
                            <FormSelect
                                id="status_disposisi"
                                options={disposisiSelectOptions}
                                value={data.status_disposisi}
                                onChange={(e) => setData('status_disposisi', e.target.value)}
                                className="w-full mt-1"
                            />
                            <InputError message={errors.status_disposisi} className="mt-1" />
                        </div>

                        {/* Dihadiri Oleh */}
                        <div>
                            <InputLabel htmlFor="dihadiri_oleh" value="Dihadiri Oleh" />
                            <TextInput
                                id="dihadiri_oleh"
                                value={data.dihadiri_oleh}
                                onChange={(e) => setData('dihadiri_oleh', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Nama yang menghadiri"
                            />
                            <InputError message={errors.dihadiri_oleh} className="mt-1" />
                        </div>

                        {/* Keterangan */}
                        <div>
                            <InputLabel htmlFor="keterangan" value="Keterangan" />
                            <FormTextarea
                                id="keterangan"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                className="w-full mt-1"
                                rows={3}
                                placeholder="Keterangan tambahan (opsional)"
                            />
                            <InputError message={errors.keterangan} className="mt-1" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-default">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default TentatifEditModal;
