import React, { useEffect } from 'react';
import { Modal, Button } from '@/Components/ui';
import { TextInput, InputLabel, InputError, FormDatePicker, FormSelect, FormTextarea, Checkbox, TimeSelect } from '@/Components/form';
import { useWilayahCascade } from '@/hooks/useWilayahCascade';
import { formatDate } from '@/utils/dateFormatter';
import { SuratMasuk } from '@/types/penjadwalan';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isEditMode: boolean;
    selectedSurat: SuratMasuk | null;
    form: any; // Inertia useForm object
    lokasiTypeOptions: { value: string; label: string }[];
}

const JadwalFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    isEditMode,
    selectedSurat,
    form,
    lokasiTypeOptions
}) => {
    const { data, setData, post, put, processing, errors, reset } = form;

    const {
        provinsiList,
        kabupatenList,
        kecamatanList,
        desaList,
        selectedProvinsi,
        setSelectedProvinsi,
        selectedKabupaten,
        setSelectedKabupaten,
        selectedKecamatan,
        setSelectedKecamatan,
        selectedDesa,
        setSelectedDesa,
    } = useWilayahCascade({ data, setData });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Form logic moved to parent usually, but here we can just execute the action
        // Actually, parent handles the URL. We should likely pass the submit handler from parent or handle data binding here.
        // Original code used `post` and `put` from `useForm` directly in the component.
        // We will trigger the Inertia submit here if we pass the proper route, OR we can just let the parent handle the submit function.
        // Let's assume parent passed the form instance so we can call methods on it.
        // However, the submit implementation is URL dependent which is in the parent.
        // Let's modify the onSubmit prop to handle the actual submission logic or keep it here if we pass the submit handler.
        // Re-reading original code: parent had `handleSubmit`. 
        // Let's add `onSubmit` prop.
    };

    // BUT, the useForm instance is passed.
    // The parent's `handleSubmit` uses data from state which this modal modifies.
    // So we just need to bind the form fields.
    // The submit button trigger can just be a prop `onSubmit`.

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
            size="lg"
        >
            {selectedSurat && (
                <form onSubmit={form.submitHandler}>
                    {/* Informasi Surat */}
                    <div className="mb-6 p-4 bg-surface-hover rounded-lg border border-border-default">
                        <h4 className="text-sm font-medium text-text-primary mb-3">Informasi Surat</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-text-secondary">Nomor Surat:</span>
                                <span className="ml-2 font-medium text-text-primary">{selectedSurat.nomor_surat}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary">Tanggal:</span>
                                <span className="ml-2 font-medium text-text-primary">{formatDate(selectedSurat.tanggal_surat)}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary">Asal:</span>
                                <span className="ml-2 font-medium text-text-primary">{selectedSurat.asal_surat}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-text-secondary">Perihal:</span>
                                <span className="ml-2 font-medium text-text-primary">{selectedSurat.perihal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Nama Kegiatan */}
                        <div>
                            <InputLabel htmlFor="nama_kegiatan" value="Nama Kegiatan *" />
                            <TextInput
                                id="nama_kegiatan"
                                value={data.nama_kegiatan}
                                onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Masukkan nama kegiatan"
                            />
                            <InputError message={errors.nama_kegiatan} className="mt-1" />
                        </div>

                        {/* Tanggal & Waktu */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="tanggal_agenda" value="Tanggal *" />
                                <FormDatePicker
                                    value={data.tanggal_agenda}
                                    onChange={(e) => setData('tanggal_agenda', e.target.value)}
                                    className="w-full mt-1"
                                />
                                <InputError message={errors.tanggal_agenda} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="waktu_mulai" value="Waktu Mulai *" />
                                <TimeSelect
                                    id="waktu_mulai"
                                    value={data.waktu_mulai}
                                    onChange={(e) => setData('waktu_mulai', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Pilih Waktu Mulai"
                                />
                                <InputError message={errors.waktu_mulai} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="waktu_selesai" value="Waktu Selesai" />
                                <TimeSelect
                                    id="waktu_selesai"
                                    value={data.waktu_selesai}
                                    onChange={(e) => setData('waktu_selesai', e.target.value)}
                                    className="w-full mt-1"
                                    disabled={data.sampai_selesai}
                                    placeholder="Pilih Waktu Selesai"
                                />
                                <InputError message={errors.waktu_selesai} className="mt-1" />
                            </div>
                        </div>

                        {/* Sampai Selesai Checkbox */}
                        <div>
                            <label className="flex items-center">
                                <Checkbox
                                    checked={data.sampai_selesai}
                                    onChange={(e) => {
                                        setData('sampai_selesai', e.target.checked);
                                        if (e.target.checked) {
                                            setData('waktu_selesai', '');
                                        }
                                    }}
                                />
                                <span className="ml-2 text-sm text-text-secondary">
                                    Sampai Selesai (tanpa jam pasti)
                                </span>
                            </label>
                        </div>

                        {/* Lokasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="lokasi_type" value="Tipe Lokasi *" />
                                <FormSelect
                                    options={lokasiTypeOptions}
                                    value={data.lokasi_type}
                                    onChange={(e) => setData('lokasi_type', e.target.value)}
                                    placeholder="Pilih Tipe Lokasi"
                                    className="w-full mt-1"
                                />
                                <InputError message={errors.lokasi_type} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="tempat" value="Tempat/Alamat *" />
                                <TextInput
                                    id="tempat"
                                    value={data.tempat}
                                    onChange={(e) => setData('tempat', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Masukkan detail lokasi"
                                />
                                <InputError message={errors.tempat} className="mt-1" />
                            </div>
                        </div>

                        {/* Wilayah Selection - Conditional based on lokasi_type */}
                        {data.lokasi_type === 'luar_daerah' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="select-provinsi" value="Provinsi" />
                                    <select
                                        id="select-provinsi"
                                        className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm"
                                        value={selectedProvinsi}
                                        onChange={(e) => {
                                            setSelectedProvinsi(e.target.value);
                                            setSelectedKabupaten('');
                                            setSelectedKecamatan('');
                                            setSelectedDesa('');
                                        }}
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {provinsiList.map((item) => (
                                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="select-kabupaten" value="Kabupaten" />
                                    <select
                                        id="select-kabupaten"
                                        className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                        value={selectedKabupaten}
                                        onChange={(e) => {
                                            setSelectedKabupaten(e.target.value);
                                            setSelectedKecamatan('');
                                            setSelectedDesa('');
                                        }}
                                        disabled={!selectedProvinsi}
                                    >
                                        <option value="">Pilih Kabupaten</option>
                                        {kabupatenList.map((item) => (
                                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Kecamatan & Desa - Show for both dalam_daerah and luar_daerah */}
                        {data.lokasi_type && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="select-kecamatan" value="Kecamatan" />
                                    <select
                                        id="select-kecamatan"
                                        className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                        value={selectedKecamatan}
                                        onChange={(e) => {
                                            setSelectedKecamatan(e.target.value);
                                            setSelectedDesa('');
                                        }}
                                        disabled={data.lokasi_type === 'luar_daerah' && !selectedKabupaten}
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                        {kecamatanList.map((item) => (
                                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="select-desa" value="Desa" />
                                    <select
                                        id="select-desa"
                                        className="w-full mt-1 border-border-default focus:border-primary focus:ring-primary rounded-md shadow-sm disabled:bg-surface-hover"
                                        value={selectedDesa}
                                        onChange={(e) => setSelectedDesa(e.target.value)}
                                        disabled={!selectedKecamatan}
                                    >
                                        <option value="">Pilih Desa</option>
                                        {desaList.map((item) => (
                                            <option key={item.kode} value={item.kode}>{item.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

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
                            {processing ? 'Menyimpan...' : (isEditMode ? 'Perbarui Jadwal' : 'Simpan Jadwal')}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default JadwalFormModal;
