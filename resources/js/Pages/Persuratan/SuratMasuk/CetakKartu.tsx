import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

interface SuratMasukTujuan {
    id: string;
    tujuan: string;
}

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
}

interface User {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string | null;
}

interface SuratMasuk {
    id: string;
    nomor_agenda: string;
    tanggal_diterima: string;
    tanggal_surat: string;
    asal_surat: string;
    nomor_surat: string;
    sifat: string;
    lampiran: number | null;
    perihal: string;
    isi_ringkas: string | null;
    tanggal_diteruskan: string | null;
    catatan_tambahan: string | null;
    tujuans: SuratMasukTujuan[];
    indeks_berkas?: IndeksSurat | null;
    kode_klasifikasi?: IndeksSurat | null;
    staff_pengolah?: User | null;
}

interface Props {
    suratMasuk: SuratMasuk;
}

const sifatLabels: Record<string, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    segera: 'Segera',
    amat_segera: 'Amat Segera',
};

export default function CetakKartu({ suratMasuk }: Props) {
    useEffect(() => {
        // Auto print when page loads
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateShort = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title={`Kartu Surat Masuk - ${suratMasuk.nomor_agenda.split('/')[1] || suratMasuk.nomor_agenda}`} />

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }

                .print-container {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 12pt;
                    line-height: 1.5;
                    color: #000;
                    background: #fff;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                }

                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .print-table th,
                .print-table td {
                    border: 1px solid #000;
                    padding: 6px 10px;
                    text-align: left;
                    vertical-align: top;
                }

                .print-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    width: 180px;
                }

                .header-title {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .header-title h1 {
                    font-size: 16pt;
                    font-weight: bold;
                    margin: 0;
                    text-transform: uppercase;
                }

                .header-title p {
                    font-size: 11pt;
                    margin: 5px 0 0 0;
                }

                .checkbox-row {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .checkbox-box {
                    width: 14px;
                    height: 14px;
                    border: 1px solid #000;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .footer-section {
                    margin-top: 30px;
                    display: flex;
                    justify-content: space-between;
                }

                .footer-section .sign-box {
                    text-align: center;
                    width: 200px;
                }

                .footer-section .sign-box .sign-line {
                    border-bottom: 1px solid #000;
                    margin-top: 60px;
                    margin-bottom: 5px;
                }
            `}</style>

            {/* Print Button (hidden on print) */}
            <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-primary text-text-inverse px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Cetak
                </button>
                <Link
                    href={route('persuratan.surat-masuk.index')}
                    className="bg-text-secondary text-text-inverse px-4 py-2 rounded-lg hover:bg-text-primary transition-colors no-underline block"
                >
                    Kembali
                </Link>
            </div>

            {/* Print Content */}
            <div className="print-container">
                {/* Header */}
                <div className="header-title">
                    <h1>Kartu Kendali Surat Masuk</h1>
                    <p>Pemerintah Kabupaten Tasikmalaya</p>
                </div>

                {/* Main Table */}
                <table className="print-table">
                    <tbody>
                        <tr>
                            <th>Nomor Agenda</th>
                            <td>{suratMasuk.nomor_agenda.split('/')[1] || suratMasuk.nomor_agenda}</td>
                        </tr>
                        <tr>
                            <th>Tanggal Diterima</th>
                            <td>{formatDate(suratMasuk.tanggal_diterima)}</td>
                        </tr>
                        <tr>
                            <th>Tanggal Surat</th>
                            <td>{formatDate(suratMasuk.tanggal_surat)}</td>
                        </tr>
                        <tr>
                            <th>Nomor Surat</th>
                            <td>{suratMasuk.nomor_surat}</td>
                        </tr>
                        <tr>
                            <th>Asal Surat</th>
                            <td>{suratMasuk.asal_surat}</td>
                        </tr>
                        <tr>
                            <th>Sifat Surat</th>
                            <td>
                                <div className="checkbox-row">
                                    {Object.entries(sifatLabels).map(([key, label]) => (
                                        <span key={key} className="checkbox-item">
                                            <span className="checkbox-box">
                                                {suratMasuk.sifat === key ? '✓' : ''}
                                            </span>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Tujuan / Ditujukan</th>
                            <td>
                                {suratMasuk.tujuans.length > 0
                                    ? suratMasuk.tujuans.map(t => t.tujuan).join(', ')
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Perihal</th>
                            <td>{suratMasuk.perihal}</td>
                        </tr>
                        <tr>
                            <th>Isi Ringkas</th>
                            <td>{suratMasuk.isi_ringkas || '-'}</td>
                        </tr>
                        <tr>
                            <th>Lampiran</th>
                            <td>{suratMasuk.lampiran || 0} berkas</td>
                        </tr>
                        <tr>
                            <th>Indeks Berkas</th>
                            <td>
                                {suratMasuk.indeks_berkas
                                    ? `${suratMasuk.indeks_berkas.kode} - ${suratMasuk.indeks_berkas.nama}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Kode Klasifikasi</th>
                            <td>
                                {suratMasuk.kode_klasifikasi
                                    ? `${suratMasuk.kode_klasifikasi.kode} - ${suratMasuk.kode_klasifikasi.nama}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Staff Pengolah</th>
                            <td>
                                {suratMasuk.staff_pengolah
                                    ? `${suratMasuk.staff_pengolah.name}${suratMasuk.staff_pengolah.nip ? ` (${suratMasuk.staff_pengolah.nip})` : ''}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Tanggal Diteruskan</th>
                            <td>{formatDate(suratMasuk.tanggal_diteruskan)}</td>
                        </tr>
                        <tr>
                            <th>Catatan Tambahan</th>
                            <td>{suratMasuk.catatan_tambahan || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer / Signature */}
                <div className="footer-section">
                    <div className="sign-box">
                        <p>Diterima oleh:</p>
                        <div className="sign-line"></div>
                        <p>Nama / NIP</p>
                    </div>
                    <div className="sign-box">
                        <p>Tasikmalaya, {formatDateShort(suratMasuk.tanggal_diterima)}</p>
                        <p>Petugas Tata Usaha</p>
                        <div className="sign-line"></div>
                        <p>Nama / NIP</p>
                    </div>
                </div>
            </div>
        </>
    );
}
