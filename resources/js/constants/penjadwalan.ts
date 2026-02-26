/**
 * Penjadwalan Constants
 * Runtime values dipindahkan dari penjadwalan.d.ts karena .d.ts tidak boleh berisi runtime values.
 */

import type { DisposisiStatus, SifatSurat } from '@/types/penjadwalan';

export const DISPOSISI_LABELS: Record<DisposisiStatus, string> = {
    menunggu: 'Menunggu',
    bupati: 'Bupati',
    wakil_bupati: 'Wakil Bupati',
    diwakilkan: 'Diwakilkan',
};

export const SIFAT_LABELS: Record<SifatSurat, string> = {
    biasa: 'Biasa',
    penting: 'Penting',
    segera: 'Segera',
    amat_segera: 'Amat Segera',
};
