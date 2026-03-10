import React, { useEffect } from 'react';
import { Modal, Button } from '@/Components/ui';
import { InputLabel, InputError, FormSelect, FormTextarea, TextInput, FormDatePicker, Checkbox, TimeSelect } from '@/Components/form';
import type { Agenda } from '@/types/penjadwalan';
import { useWilayahCascade } from '@/hooks/useWilayahCascade';
import { formatDateShort } from '@/utils';

interface TindakLanjutFormData {
    tanggal_agenda: string;
    waktu_mulai: string;
    waktu_selesai: string;
    sampai_selesai: boolean;
    lokasi_type: string;
    provinsi_id: string;
    kabupaten_id: string;
    kecamatan_id: string;
    desa_id: string;
    tempat: string;
    status_kehadiran: string;
    nama_yang_mewakili: string;
    jabatan_yang_mewakili: string;
    keterangan: string;
    [key: string]: unknown;
}

interface TindakLanjutForm {
    data: TindakLanjutFormData;
    setData: <K extends keyof TindakLanjutFormData>(key: K, value: TindakLanjutFormData[K]) => void;
    processing: boolean;
    errors: Partial<Record<keyof TindakLanjutFormData, string>>;
    submitHandler: (e: React.FormEvent) => void;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedAgenda: Agenda | null;
    form: TindakLanjutForm;
}

const TindakLanjutModal: React.FC<Props> = ({
    isOpen,
    onClose,
    selectedAgenda,
    form,
}) => {
    const { data, setData, processing, errors, submitHandler } = form;

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
    } = useWilayahCascade({
        data,
        setData: (field, value) => setData(field as keyof TindakLanjutFormData, value as any),
    });

    useEffect(() => {
        if (isOpen) {
            setSelectedProvinsi(data.provinsi_id || '');
            setSelectedKabupaten(data.kabupaten_id || '');
            setSelectedKecamatan(data.kecamatan_id || '');
            setSelectedDesa(data.desa_id || '');
        }
    }, [isOpen]);

    useEffect(() => { setData('provinsi_id', selectedProvinsi); }, [selectedProvinsi]);
    useEffect(() => { setData('kabupaten_id', selectedKabupaten); }, [selectedKabupaten]);
    useEffect(() => { setData('kecamatan_id', selectedKecamatan); }, [selectedKecamatan]);
    useEffect(() => { setData('desa_id', selectedDesa); }, [selectedDesa]);

    const lokasiOptions = [
        { value: 'dalam_daerah', label: 'Dalam Daerah' },
        { value: 'luar_daerah', label: 'Luar Daerah' },
    ];

    const statusKehadiranOptions = [
        { value: 'Dihadiri', label: 'Dihadiri (Saya Sendiri)' },
        { value: 'Diwakilkan', label: 'Diwakilkan' },
        { value: 'Tidak Dihadiri', label: 'Tidak Dihadiri' },
    ];

    const provinsiSelectOptions = provinsiList.map(item => ({ value: item.kode, label: item.nama }));
    const kabupatenSelectOptions = kabupatenList.map(item => ({ value: item.kode, label: item.nama }));
    const kecamatanSelectOptions = kecamatanList.map(item => ({ value: item.kode, label: item.nama }));
    const desaSelectOptions = desaList.map(item => ({ value: item.kode, label: item.nama }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tindak Lanjut Jadwal (Jadikan Definitif)"
            size="2xl"
        >
            {selectedAgenda && (
                <form onSubmit={submitHandler}>
                    <div className="mb-6 p-4 bg-surface-hover rounded-lg border border-border-default space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wide border-b border-border-default pb-1">Identitas Surat</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-text-secondary block text-xs">Asal Surat</span>
                                    <span className="font-medium text-text-primary">
                                        {selectedAgenda.surat_masuk?.asal_surat || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block text-xs">Perihal</span>
                                    <span className="font-medium text-text-primary">
                                        {selectedAgenda.surat_masuk?.perihal || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wide border-b border-border-default pb-1">Identitas Agenda</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-text-secondary block text-xs">Nomor Agenda</span>
                                    <span className="font-medium text-text-primary">
                                        {selectedAgenda.surat_masuk?.nomor_agenda ? (selectedAgenda.surat_masuk.nomor_agenda.split('/')[1] || selectedAgenda.surat_masuk.nomor_agenda) : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block text-xs">Tanggal Diterima</span>
                                    <span className="font-medium text-text-primary">
                                        {selectedAgenda.surat_masuk?.tanggal_diterima ? formatDateShort(selectedAgenda.surat_masuk.tanggal_diterima) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="tanggal_agenda" value="Tanggal Kegiatan *" />
                                <FormDatePicker
                                    id="tanggal_agenda"
                                    value={data.tanggal_agenda}
                                    onChange={(e: any) => setData('tanggal_agenda', e?.target ? e.target.value : e)}
                                    placeholder="Pilih Tanggal"
                                />
                                <InputError message={errors.tanggal_agenda} className="mt-1" />
                            </div>
                            <div className="flex flex-col gap-2 pt-8">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        checked={data.sampai_selesai}
                                        onChange={(e) => setData('sampai_selesai', e.target.checked)}
                                    />
                                    <span className="text-sm text-text-primary">Sampai dengan selesai</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="waktu_mulai" value="Waktu Mulai *" />
                                <TimeSelect
                                    id="waktu_mulai"
                                    value={data.waktu_mulai}
                                    onChange={(e) => setData('waktu_mulai', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Pilih Waktu Mulai (WIB)"
                                />
                                <InputError message={errors.waktu_mulai} className="mt-1" />
                            </div>
                            {!data.sampai_selesai && (
                                <div>
                                    <InputLabel htmlFor="waktu_selesai" value="Waktu Selesai (Opsional)" />
                                    <TimeSelect
                                        id="waktu_selesai"
                                        value={data.waktu_selesai}
                                        onChange={(e) => setData('waktu_selesai', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Pilih Waktu Selesai (WIB)"
                                    />
                                    <InputError message={errors.waktu_selesai} className="mt-1" />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border-default my-4 pt-4"></div>

                        <div>
                            <InputLabel htmlFor="lokasi_type" value="Jenis Lokasi *" />
                            <FormSelect
                                id="lokasi_type"
                                options={lokasiOptions}
                                value={data.lokasi_type}
                                onChange={(e) => setData('lokasi_type', e.target.value)}
                                className="w-full mt-1"
                            />
                            <InputError message={errors.lokasi_type} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.lokasi_type === 'luar_daerah' && (
                                <>
                                    <div>
                                        <InputLabel htmlFor="provinsi_id" value="Provinsi *" />
                                        <FormSelect
                                            id="provinsi_id"
                                            options={provinsiSelectOptions}
                                            value={selectedProvinsi}
                                            onChange={(e) => setSelectedProvinsi(e.target.value)}
                                            placeholder="Pilih Provinsi"
                                            className="w-full mt-1"
                                        />
                                        <InputError message={errors.provinsi_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="kabupaten_id" value="Kabupaten/Kota *" />
                                        <FormSelect
                                            id="kabupaten_id"
                                            options={kabupatenSelectOptions}
                                            value={selectedKabupaten}
                                            onChange={(e) => setSelectedKabupaten(e.target.value)}
                                            placeholder="Pilih Kabupaten/Kota"
                                            className="w-full mt-1"
                                            disabled={!selectedProvinsi}
                                        />
                                        <InputError message={errors.kabupaten_id} className="mt-1" />
                                    </div>
                                </>
                            )}

                            {data.lokasi_type === 'dalam_daerah' && (
                                <>
                                    <div>
                                        <InputLabel htmlFor="kecamatan_id" value="Kecamatan *" />
                                        <FormSelect
                                            id="kecamatan_id"
                                            options={kecamatanSelectOptions}
                                            value={selectedKecamatan}
                                            onChange={(e) => setSelectedKecamatan(e.target.value)}
                                            placeholder="Pilih Kecamatan"
                                            className="w-full mt-1"
                                        />
                                        <InputError message={errors.kecamatan_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="desa_id" value="Desa/Kelurahan *" />
                                        <FormSelect
                                            id="desa_id"
                                            options={desaSelectOptions}
                                            value={selectedDesa}
                                            onChange={(e) => setSelectedDesa(e.target.value)}
                                            placeholder="Pilih Desa/Kelurahan"
                                            className="w-full mt-1"
                                            disabled={!selectedKecamatan}
                                        />
                                        <InputError message={errors.desa_id} className="mt-1" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="tempat" value="Tempat Kegiatan *" />
                            <TextInput
                                id="tempat"
                                type="text"
                                value={data.tempat}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('tempat', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Masukkan tempat kegiatan..."
                            />
                            <InputError message={errors.tempat} className="mt-1" />
                        </div>

                        <div className="border-t border-border-default my-4 pt-4"></div>

                        <div>
                            <InputLabel htmlFor="status_kehadiran" value="Status Kehadiran *" />
                            <FormSelect
                                id="status_kehadiran"
                                options={statusKehadiranOptions}
                                value={data.status_kehadiran}
                                onChange={(e) => setData('status_kehadiran', e.target.value)}
                                className="w-full mt-1"
                            />
                            <InputError message={errors.status_kehadiran} className="mt-1" />
                        </div>

                        {data.status_kehadiran === 'Diwakilkan' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="nama_yang_mewakili" value="Nama Perwakilan" />
                                    <TextInput
                                        id="nama_yang_mewakili"
                                        type="text"
                                        value={data.nama_yang_mewakili}
                                        onChange={(e) => setData('nama_yang_mewakili', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Nama yang mewakili"
                                    />
                                    <InputError message={errors.nama_yang_mewakili} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="jabatan_yang_mewakili" value="Jabatan Perwakilan" />
                                    <TextInput
                                        id="jabatan_yang_mewakili"
                                        type="text"
                                        value={data.jabatan_yang_mewakili}
                                        onChange={(e) => setData('jabatan_yang_mewakili', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Jabatan"
                                    />
                                    <InputError message={errors.jabatan_yang_mewakili} className="mt-1" />
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="keterangan" value="Keterangan / Catatan Tambahan" />
                            <FormTextarea
                                id="keterangan"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                className="w-full mt-1"
                                rows={3}
                                placeholder={data.status_kehadiran === 'Diwakilkan' ? "Tambahkan catatan jika diperlukan" : "Jika tidak hadir berikan alasan, dsb"}
                            />
                            <InputError message={errors.keterangan} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-default">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} variant="success">
                            {processing ? 'Menyimpan...' : 'Simpan & Jadikan Definitif'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default TindakLanjutModal;
