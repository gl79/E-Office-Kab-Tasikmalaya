import React from 'react';
import { Head } from '@inertiajs/react';
import { formatDateShort } from '@/utils'; // Assuming this utility exists, otherwise use local helper

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    tanggal_diterima: string;
    tanggal_surat: string;
    asal_surat: string;
    nomor_surat: string;
    sifat: string;
    perihal: string;
    isi_ringkas: string | null;
    lampiran: number | null;
    indeks_berkas?: { kode: string; nama: string } | null;
    staff_pengolah?: { name: string } | null;
    created_by?: { name: string } | null;
    created_at: string;
    tujuans: { tujuan: string }[];
}

interface Props {
    suratMasuk: SuratMasuk;
}

export default function CetakIsi({ suratMasuk }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white min-h-screen p-8 font-serif text-black">
            <Head title={`Cetak Isi Surat - ${suratMasuk.nomor_agenda}`} />

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
                    <h2 className="text-2xl font-bold uppercase mt-1">Lembar Isi Surat Masuk</h2>
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Nomor Agenda</span>
                        <span>{suratMasuk.nomor_agenda}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Tanggal Diterima</span>
                        <span>{formatDateShort(suratMasuk.tanggal_diterima)}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Nomor Surat</span>
                        <span>{suratMasuk.nomor_surat}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Tanggal Surat</span>
                        <span>{formatDateShort(suratMasuk.tanggal_surat)}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Asal Surat</span>
                        <span>{suratMasuk.asal_surat}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Sifat</span>
                        <span className="uppercase">{suratMasuk.sifat.replace('_', ' ')}</span>
                    </div>
                    <div>
                        <span className="font-bold block uppercase text-xs text-gray-500">Indeks Berkas</span>
                        <span>{suratMasuk.indeks_berkas ? `${suratMasuk.indeks_berkas.kode} - ${suratMasuk.indeks_berkas.nama}` : '-'}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <div className="mb-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-1">Tujuan</span>
                        <div className="flex flex-wrap gap-2">
                            {suratMasuk.tujuans.map((t, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm print:bg-transparent print:p-0 print:mr-2">
                                    {t.tujuan}
                                    {idx < suratMasuk.tujuans.length - 1 ? ',' : ''}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-2">Perihal</span>
                        <p className="text-lg font-medium leading-relaxed">{suratMasuk.perihal}</p>
                    </div>

                    <div className="border-t border-gray-200 py-6">
                        <span className="font-bold block uppercase text-xs text-gray-500 mb-2">Isi Ringkas</span>
                        <p className="whitespace-pre-wrap leading-relaxed text-justify">
                            {suratMasuk.isi_ringkas || '-'}
                        </p>
                    </div>
                </div>

                {/* Footer / Audit */}
                <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <div>
                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </div>
                    <div>
                        Diinput oleh: {suratMasuk.created_by?.name || 'System'}
                    </div>
                </div>
            </div>
        </div>
    );
}
