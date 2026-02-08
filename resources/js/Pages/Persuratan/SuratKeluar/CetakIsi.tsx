import React from 'react';
import { Head } from '@inertiajs/react';
import { formatDateShort } from '@/utils';

interface SuratKeluar {
    id: string;
    no_urut: string;
    tanggal_surat: string;
    nomor_surat: string;
    kepada: string;
    perihal: string;
    isi_ringkas: string | null;
    sifat_1: string;
    lampiran: number | null;
    catatan: string | null;
    kode_pengolah: string | null;
    indeks?: { kode: string; nama: string; jenis_surat?: string } | null;
    unit_kerja?: { nama: string; singkatan?: string | null } | null;
    created_by?: { name: string } | null;
    created_at: string;
}

interface Props {
    suratKeluar: SuratKeluar;
}

export default function CetakIsi({ suratKeluar }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white min-h-screen p-8 font-serif text-black">
            <Head title={`Cetak Isi Surat - ${suratKeluar.no_urut}`} />

            {/* Print Button - Hidden when printing */}
            <div className="print:hidden mb-6 flex justify-end">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    Cetak Halaman
                </button>
            </div>

            <div className="max-w-3xl mx-auto border border-gray-200 p-8 shadow-sm print:shadow-none print:border-none print:p-0">
                {/* Header / Kop */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-xl font-bold uppercase tracking-wide">Pemerintah Kabupaten Tasikmalaya</h1>
                    <h2 className="text-2xl font-bold uppercase mt-1">Lembar Isi Surat Keluar</h2>
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Nomor Urut</span>
                        <span>{suratKeluar.no_urut}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Tanggal Surat</span>
                        <span>{formatDateShort(suratKeluar.tanggal_surat)}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Nomor Surat</span>
                        <span>{suratKeluar.nomor_surat}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Sifat</span>
                        <span className="uppercase">{suratKeluar.sifat_1.replace('_', ' ')}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Indeks</span>
                        <span>{suratKeluar.indeks ? `${suratKeluar.indeks.kode} - ${suratKeluar.indeks.nama}` : '-'}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Jenis Surat</span>
                        <span>{suratKeluar.indeks?.jenis_surat || '-'}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Unit Pengolah</span>
                        <span>
                            {suratKeluar.unit_kerja
                                ? suratKeluar.unit_kerja.singkatan
                                    ? `${suratKeluar.unit_kerja.nama} (${suratKeluar.unit_kerja.singkatan})`
                                    : suratKeluar.unit_kerja.nama
                                : '-'}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Kode Pengolah</span>
                        <span>{suratKeluar.kode_pengolah || '-'}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <div className="mb-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-1">Kepada</span>
                        <p className="text-sm">{suratKeluar.kepada}</p>
                    </div>

                    <div className="mb-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-2">Perihal</span>
                        <p className="text-lg font-medium leading-relaxed">{suratKeluar.perihal}</p>
                    </div>

                    {suratKeluar.lampiran !== null && suratKeluar.lampiran !== undefined && (
                        <div className="mb-6">
                            <span className="font-bold block uppercase text-xs text-gray-500 mb-1">Lampiran</span>
                            <p className="text-sm">{suratKeluar.lampiran}</p>
                        </div>
                    )}

                    <div className="border-t border-gray-200 py-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-2">Isi Ringkas</span>
                        <p className="whitespace-pre-wrap leading-relaxed text-justify">
                            {suratKeluar.isi_ringkas || '-'}
                        </p>
                    </div>

                    {suratKeluar.catatan && (
                        <div className="border-t border-gray-200 py-6">
                            <span className="font-bold block uppercase text-xs text-gray-500 mb-2">Catatan</span>
                            <p className="whitespace-pre-wrap leading-relaxed text-justify">
                                {suratKeluar.catatan}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer / Audit */}
                <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <div>
                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </div>
                    <div>
                        Diinput oleh: {suratKeluar.created_by?.name || 'System'}
                    </div>
                </div>
            </div>
        </div>
    );
}
