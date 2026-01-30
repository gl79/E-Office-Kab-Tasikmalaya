import axios from 'axios';

export interface Provinsi {
    kode: string;
    nama: string;
}

export interface Kabupaten {
    provinsi_kode: string;
    kode: string;
    nama: string;
}

export interface Kecamatan {
    provinsi_kode: string;
    kabupaten_kode: string;
    kode: string;
    nama: string;
}

export interface Desa {
    provinsi_kode: string;
    kabupaten_kode: string;
    kecamatan_kode: string;
    kode: string;
    nama: string;
}

export const wilayahService = {
    getAllProvinsi: () =>
        axios.get<Provinsi[]>(route('master.wilayah.provinsi.all')),

    getKabupatenByProvinsi: (provinsiKode: string) =>
        axios.get<Kabupaten[]>(route('master.wilayah.kabupaten.by-provinsi', { provinsiKode })),

    getKecamatanByKabupaten: (provinsiKode: string, kabupatenKode: string) =>
        axios.get<Kecamatan[]>(route('master.wilayah.kecamatan.by-kabupaten', {
            provinsiKode,
            kabupatenKode
        })),

    getDesaByKecamatan: (provinsiKode: string, kabupatenKode: string, kecamatanKode: string) =>
        axios.get<Desa[]>(route('master.wilayah.desa.by-kecamatan', {
            provinsiKode,
            kabupatenKode,
            kecamatanKode
        })),
};

export default wilayahService;
