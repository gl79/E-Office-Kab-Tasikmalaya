import React from 'react';
import { Modal, Button } from '@/Components/ui';
import { InputLabel, InputError, FormSelect, FormTextarea, FormSearchableSelect } from '@/Components/form';
import type { Agenda } from '@/types/penjadwalan';

interface TentatifEditFormData {
    dihadiri_oleh: string;
    dihadiri_oleh_custom: string;
    status_disposisi: string;
    keterangan: string;
}

interface TentatifEditForm {
    data: TentatifEditFormData;
    setData: <K extends keyof TentatifEditFormData>(key: K, value: TentatifEditFormData[K]) => void;
    processing: boolean;
    errors: Partial<Record<keyof TentatifEditFormData, string>>;
    submitHandler: (e: React.FormEvent) => void;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedAgenda: Agenda | null;
    form: TentatifEditForm;
    disposisiSelectOptions: { value: string; label: string }[];
    dihadiriOlehSelectOptions: { value: string; label: string }[];
}

const TentatifEditModal: React.FC<Props> = ({
    isOpen,
    onClose,
    selectedAgenda,
    form,
    disposisiSelectOptions,
    dihadiriOlehSelectOptions,
}) => {
    const { data, setData, processing, errors, submitHandler } = form;

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
                            <FormSearchableSelect
                                id="dihadiri_oleh"
                                options={dihadiriOlehSelectOptions}
                                value={data.dihadiri_oleh}
                                customValue={data.dihadiri_oleh_custom}
                                onChange={(value) => {
                                    setData('dihadiri_oleh', value);
                                    if (value) {
                                        setData('dihadiri_oleh_custom', '');
                                    }
                                }}
                                onCustomChange={(customValue) => {
                                    setData('dihadiri_oleh', '');
                                    setData('dihadiri_oleh_custom', customValue);
                                }}
                                placeholder="Pilih atau cari pengguna..."
                                customPlaceholder="Tambah manual nama yang menghadiri..."
                                allowCustom={true}
                                className="w-full mt-1"
                                error={errors.dihadiri_oleh || errors.dihadiri_oleh_custom}
                            />
                            <InputError message={errors.dihadiri_oleh} className="mt-1" />
                            <InputError message={errors.dihadiri_oleh_custom} className="mt-1" />
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
