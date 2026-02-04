import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

interface IndeksSurat {
    id: string;
    kode: string;
    nama: string;
}

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string;
}

interface SuratKeluar {
    id: string;
    tanggal_surat: string;
    no_urut: string;
    nomor_surat: string;
    kepada: string;
    perihal: string;
    isi_ringkas: string | null;
    sifat_1: string;
    sifat_2: string | null;
    lampiran: number | null;
    kode_pengolah: string | null;
    catatan: string | null;
    indeks?: IndeksSurat | null;
    kode_klasifikasi?: IndeksSurat | null;
    unit_kerja?: UnitKerja | null;
}

interface Props {
    suratKeluar: SuratKeluar;
}

const sifat1Labels: Record<string, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    rahasia: 'Rahasia',
    segera: 'Segera',
};

const sifat2Labels: Record<string, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    segera: 'Segera',
    amat_segera: 'Amat Segera',
};

export default function CetakKartu({ suratKeluar }: Props) {
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
            <Head title={`Kartu Surat Keluar - ${suratKeluar.nomor_surat}`} />

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
                    href={route('persuratan.surat-keluar.index')}
                    className="bg-text-secondary text-text-inverse px-4 py-2 rounded-lg hover:bg-text-primary transition-colors no-underline block"
                >
                    Kembali
                </Link>
            </div>

            {/* Print Content */}
            <div className="print-container">
                {/* Header */}
                <div className="header-title">
                    <h1>Kartu Kendali Surat Keluar</h1>
                    <p>Pemerintah Kabupaten Tasikmalaya</p>
                </div>

                {/* Main Table */}
                <table className="print-table">
                    <tbody>
                        <tr>
                            <th>No. Urut / Agenda</th>
                            <td>{suratKeluar.no_urut}</td>
                        </tr>
                        <tr>
                            <th>Tanggal Surat</th>
                            <td>{formatDate(suratKeluar.tanggal_surat)}</td>
                        </tr>
                        <tr>
                            <th>Nomor Surat</th>
                            <td>{suratKeluar.nomor_surat}</td>
                        </tr>
                        <tr>
                            <th>Kepada / Tujuan</th>
                            <td>{suratKeluar.kepada}</td>
                        </tr>
                        <tr>
                            <th>Perihal</th>
                            <td>{suratKeluar.perihal}</td>
                        </tr>
                        <tr>
                            <th>Isi Ringkas</th>
                            <td>{suratKeluar.isi_ringkas || '-'}</td>
                        </tr>
                        <tr>
                            <th>Sifat (Klasifikasi)</th>
                            <td>
                                <div className="checkbox-row">
                                    {Object.entries(sifat1Labels).map(([key, label]) => (
                                        <span key={key} className="checkbox-item">
                                            <span className="checkbox-box">
                                                {suratKeluar.sifat_1 === key ? '✓' : ''}
                                            </span>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        {suratKeluar.sifat_2 && (
                            <tr>
                                <th>Sifat (Urgensi)</th>
                                <td>
                                    <div className="checkbox-row">
                                        {Object.entries(sifat2Labels).map(([key, label]) => (
                                            <span key={key} className="checkbox-item">
                                                <span className="checkbox-box">
                                                    {suratKeluar.sifat_2 === key ? '✓' : ''}
                                                </span>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <th>Lampiran</th>
                            <td>{suratKeluar.lampiran || 0} berkas</td>
                        </tr>
                        <tr>
                            <th>Indeks</th>
                            <td>
                                {suratKeluar.indeks
                                    ? `${suratKeluar.indeks.kode} - ${suratKeluar.indeks.nama}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Kode Klasifikasi</th>
                            <td>
                                {suratKeluar.kode_klasifikasi
                                    ? `${suratKeluar.kode_klasifikasi.kode} - ${suratKeluar.kode_klasifikasi.nama}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Unit Kerja</th>
                            <td>
                                {suratKeluar.unit_kerja
                                    ? `${suratKeluar.unit_kerja.nama}${suratKeluar.unit_kerja.singkatan ? ` (${suratKeluar.unit_kerja.singkatan})` : ''}`
                                    : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th>Kode Pengolah</th>
                            <td>{suratKeluar.kode_pengolah || '-'}</td>
                        </tr>
                        <tr>
                            <th>Catatan</th>
                            <td>{suratKeluar.catatan || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer / Signature */}
                <div className="footer-section">
                    <div className="sign-box">
                        <p>Dikirim oleh:</p>
                        <div className="sign-line"></div>
                        <p>Nama / NIP</p>
                    </div>
                    <div className="sign-box">
                        <p>Tasikmalaya, {formatDateShort(suratKeluar.tanggal_surat)}</p>
                        <p>Petugas Tata Usaha</p>
                        <div className="sign-line"></div>
                        <p>Nama / NIP</p>
                    </div>
                </div>
            </div>
        </>
    );
}
