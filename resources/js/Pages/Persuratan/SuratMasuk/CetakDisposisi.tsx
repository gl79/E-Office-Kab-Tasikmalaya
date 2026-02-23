import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

interface SuratMasukTujuan {
    id: string;
    tujuan: string;
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
    tujuans: SuratMasukTujuan[];
}

interface PenandaTangan {
    nama: string;
    jabatan: string;
}

interface Props {
    suratMasuk: SuratMasuk;
    penandaTangan: PenandaTangan;
}

const sifatLabels: Record<string, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    segera: 'Segera',
    amat_segera: 'Amat Segera',
};

// Disposisi instruction options
const instruksiOptions = [
    'Untuk diketahui',
    'Untuk dilaksanakan',
    'Untuk ditindaklanjuti',
    'Untuk dikoordinasikan',
    'Untuk disiapkan',
    'Untuk dijadwalkan',
    'Untuk hadir',
    'Ikuti Petunjuk',
    'Sesuai Disposisi',
];

// Tujuan disposisi options
const tujuanDisposisiOptions = [
    'Sekda',
    'Asda 1',
    'Asda 2',
    'Asda 3',
    'Kepala Dinas terkait',
    'Kepala Badan terkait',
    'Camat terkait',
    'Ajudan',
    'Staf TU',
];

export default function CetakDisposisi({ suratMasuk, penandaTangan }: Props) {
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

    const today = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title={`Lembar Disposisi - ${suratMasuk.nomor_agenda.split('/')[1] || suratMasuk.nomor_agenda}`} />

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
                    font-size: 11pt;
                    line-height: 1.4;
                    color: #000;
                    background: #fff;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 15px;
                }

                .header-section {
                    display: flex;
                    align-items: center;
                    border-bottom: 3px double #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }

                .header-logo {
                    width: 70px;
                    height: 70px;
                    margin-right: 15px;
                }

                .header-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .header-text {
                    flex: 1;
                    text-align: center;
                }

                .header-text h1 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin: 0;
                    text-transform: uppercase;
                }

                .header-text h2 {
                    font-size: 18pt;
                    font-weight: bold;
                    margin: 5px 0;
                    text-transform: uppercase;
                }

                .header-text p {
                    font-size: 10pt;
                    margin: 2px 0;
                }

                .title-section {
                    text-align: center;
                    margin: 15px 0;
                }

                .title-section h3 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin: 0;
                    text-decoration: underline;
                    text-transform: uppercase;
                }

                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }

                .info-table td {
                    padding: 4px 8px;
                    vertical-align: top;
                }

                .info-table td:first-child {
                    width: 150px;
                    font-weight: bold;
                }

                .main-section {
                    display: flex;
                    gap: 15px;
                    margin-top: 15px;
                }

                .left-section {
                    flex: 1;
                    border: 1px solid #000;
                    padding: 10px;
                }

                .right-section {
                    flex: 1;
                    border: 1px solid #000;
                    padding: 10px;
                }

                .section-title {
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                    text-decoration: underline;
                }

                .checkbox-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .checkbox-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 5px;
                    font-size: 10pt;
                }

                .checkbox-box {
                    width: 12px;
                    height: 12px;
                    border: 1px solid #000;
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    margin-top: 2px;
                }

                .catatan-box {
                    border: 1px solid #000;
                    padding: 10px;
                    margin-top: 15px;
                    min-height: 80px;
                }

                .catatan-box .label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .signature-section {
                    margin-top: 20px;
                    display: flex;
                    justify-content: flex-end;
                }

                .signature-box {
                    text-align: center;
                    width: 250px;
                }

                .signature-box .date {
                    margin-bottom: 5px;
                }

                .signature-box .title {
                    font-weight: bold;
                    margin-bottom: 60px;
                }

                .signature-box .name {
                    font-weight: bold;
                    text-decoration: underline;
                }

                .signature-box .nip {
                    font-size: 10pt;
                }

                .sifat-row {
                    display: flex;
                    gap: 15px;
                    margin-top: 5px;
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
                <div className="header-section">
                    <div className="header-logo">
                        <img src="/images/pemkabtasik.png" alt="Logo" />
                    </div>
                    <div className="header-text">
                        <h1>Pemerintah Kabupaten Tasikmalaya</h1>
                        <h2>Sekretariat Daerah</h2>
                        <p>Jl. Sutisna Senjaya No. 10 Singaparna</p>
                        <p>Telp. (0265) 541126 - 541127 Fax. (0265) 541128</p>
                    </div>
                </div>

                {/* Title */}
                <div className="title-section">
                    <h3>Lembar Disposisi</h3>
                </div>

                {/* Info Table */}
                <table className="info-table">
                    <tbody>
                        <tr>
                            <td>Tanggal Diterima</td>
                            <td>: {formatDate(suratMasuk.tanggal_diterima)}</td>
                        </tr>
                        <tr>
                            <td>Nomor Agenda</td>
                            <td>: {suratMasuk.nomor_agenda.split('/')[1] || suratMasuk.nomor_agenda}</td>
                        </tr>
                        <tr>
                            <td>Asal Surat</td>
                            <td>: {suratMasuk.asal_surat}</td>
                        </tr>
                        <tr>
                            <td>Tanggal Surat</td>
                            <td>: {formatDate(suratMasuk.tanggal_surat)}</td>
                        </tr>
                        <tr>
                            <td>Nomor Surat</td>
                            <td>: {suratMasuk.nomor_surat}</td>
                        </tr>
                        <tr>
                            <td>Perihal</td>
                            <td>: {suratMasuk.perihal}</td>
                        </tr>
                        <tr>
                            <td>Lampiran</td>
                            <td>: {suratMasuk.lampiran || 0} berkas</td>
                        </tr>
                        <tr>
                            <td>Sifat</td>
                            <td>
                                :
                                <div className="sifat-row" style={{ display: 'inline-flex', marginLeft: '5px' }}>
                                    {Object.entries(sifatLabels).map(([key, label]) => (
                                        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '3px', marginRight: '10px' }}>
                                            <span className="checkbox-box">
                                                {suratMasuk.sifat === key ? '✓' : ''}
                                            </span>
                                            <span style={{ fontSize: '10pt' }}>{label}</span>
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Main Content - Two Columns */}
                <div className="main-section">
                    {/* Left - Diteruskan Kepada */}
                    <div className="left-section">
                        <div className="section-title">Diteruskan Kepada</div>
                        <ul className="checkbox-list">
                            {tujuanDisposisiOptions.map((tujuan, index) => (
                                <li key={index}>
                                    <span className="checkbox-box"></span>
                                    <span>{tujuan}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right - Instruksi */}
                    <div className="right-section">
                        <div className="section-title">Instruksi / Catatan</div>
                        <ul className="checkbox-list">
                            {instruksiOptions.map((instruksi, index) => (
                                <li key={index}>
                                    <span className="checkbox-box"></span>
                                    <span>{instruksi}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Catatan Tambahan */}
                <div className="catatan-box">
                    <div className="label">Catatan:</div>
                    <div style={{ minHeight: '50px' }}></div>
                </div>

                {/* Signature */}
                <div className="signature-section">
                    <div className="signature-box">
                        <div className="date">Tasikmalaya, {today}</div>
                        <div className="title">{penandaTangan.jabatan}</div>
                        <div className="name">{penandaTangan.nama}</div>
                    </div>
                </div>
            </div>
        </>
    );
}
