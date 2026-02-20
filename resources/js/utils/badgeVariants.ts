import type { DisposisiStatus, SifatSurat, PenjadwalanStatus, PenjadwalanStatusFormal } from '@/types/penjadwalan';

/**
 * Badge Variant Types
 * Centralized badge variant configurations for consistency across the app
 */

export type BadgeVariant = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

// ============================================
// DISPOSISI STATUS BADGE CONFIG
// ============================================

export const disposisiBadgeConfig: Record<DisposisiStatus, {
    variant: BadgeVariant;
    label: string;
}> = {
    menunggu: { variant: 'warning', label: 'Menunggu' },
    bupati: { variant: 'info', label: 'Bupati' },
    wakil_bupati: { variant: 'success', label: 'Wakil Bupati' },
    diwakilkan: { variant: 'success', label: 'Diwakilkan' },
};

export function getDisposisiVariant(status: string): BadgeVariant {
    return disposisiBadgeConfig[status as DisposisiStatus]?.variant ?? 'default';
}

export function getDisposisiLabel(status: string): string {
    return disposisiBadgeConfig[status as DisposisiStatus]?.label ?? status;
}

// ============================================
// SIFAT SURAT BADGE CONFIG
// ============================================

export const sifatBadgeConfig: Record<SifatSurat, {
    variant: BadgeVariant;
    label: string;
}> = {
    biasa: { variant: 'default', label: 'Biasa' },
    penting: { variant: 'info', label: 'Penting' },
    segera: { variant: 'warning', label: 'Segera' },
    amat_segera: { variant: 'danger', label: 'Amat Segera' },
};

export function getSifatVariant(sifat: string): BadgeVariant {
    return sifatBadgeConfig[sifat as SifatSurat]?.variant ?? 'default';
}

export function getSifatLabel(sifat: string): string {
    return sifatBadgeConfig[sifat as SifatSurat]?.label ?? sifat;
}

// ============================================
// PENJADWALAN STATUS BADGE CONFIG
// ============================================

export const penjadwalanStatusBadgeConfig: Record<PenjadwalanStatus, {
    variant: BadgeVariant;
    label: string;
}> = {
    tentatif: { variant: 'warning', label: 'Tentatif' },
    definitif: { variant: 'success', label: 'Definitif' },
};

export function getPenjadwalanStatusVariant(status: string): BadgeVariant {
    return penjadwalanStatusBadgeConfig[status as PenjadwalanStatus]?.variant ?? 'default';
}

export function getPenjadwalanStatusLabel(status: string): string {
    return penjadwalanStatusBadgeConfig[status as PenjadwalanStatus]?.label ?? status;
}

// ============================================
// PENJADWALAN STATUS FORMAL BADGE CONFIG
// ============================================

export const penjadwalanStatusFormalBadgeConfig: Record<PenjadwalanStatusFormal, {
    variant: BadgeVariant;
    label: string;
}> = {
    terjadwal: { variant: 'info', label: 'Terjadwal' },
    dalam_proses: { variant: 'warning', label: 'Dalam Proses' },
    didisposisikan: { variant: 'primary', label: 'Didisposisikan' },
    selesai: { variant: 'success', label: 'Selesai' },
    ditunda: { variant: 'warning', label: 'Ditunda' },
    dibatalkan: { variant: 'danger', label: 'Dibatalkan' },
};

export function getPenjadwalanFormalStatusVariant(status: string): BadgeVariant {
    return penjadwalanStatusFormalBadgeConfig[status as PenjadwalanStatusFormal]?.variant ?? 'default';
}

export function getPenjadwalanFormalStatusLabel(status: string): string {
    return penjadwalanStatusFormalBadgeConfig[status as PenjadwalanStatusFormal]?.label ?? status;
}

