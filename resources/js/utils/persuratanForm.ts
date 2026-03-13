interface UserLike {
    id?: string | number;
    name: string;
    jabatan_nama?: string | null;
}

const EXCLUDED_USER_NAMES = new Set(['Sekpri Bupati', 'Sekpri Wakil Bupati']);
const SPECIAL_JABATAN_PATTERNS = [
    /\bwakil\s+bupati\b/i,
    /\bbupati\b/i,
    /\btata\s+usaha\b/i,
    /\bsekretaris\s+daerah\b/i,
];

interface LabelOptions {
    includeNameInLabel?: boolean;
    specialJabatanOnly?: boolean;
}

export function isSpecialJabatanLabel(jabatanNama?: string | null): boolean {
    if (!jabatanNama) {
        return false;
    }

    const normalized = jabatanNama.trim().replace(/\s+/g, ' ');
    return SPECIAL_JABATAN_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function formatUserLabel(user: UserLike, options: LabelOptions = {}): string {
    const includeNameInLabel = options.includeNameInLabel ?? false;
    const specialJabatanOnly = options.specialJabatanOnly ?? false;

    if (user.jabatan_nama && includeNameInLabel && !(specialJabatanOnly && isSpecialJabatanLabel(user.jabatan_nama))) {
        return `${user.jabatan_nama} - ${user.name}`;
    }

    return user.jabatan_nama ? user.jabatan_nama : user.name;
}

export function buildInternalUserOptions(
    users: UserLike[],
    options: LabelOptions = {}
) {
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => ({
            value: String(user.id ?? ''),
            label: formatUserLabel(user, options),
        }));
}

export function buildKepadaUserOptions(users: UserLike[], options: LabelOptions = {}) {
    const mergedOptions: LabelOptions = {
        includeNameInLabel: true,
        specialJabatanOnly: true,
        ...options,
    };
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => {
            const label = formatUserLabel(user, mergedOptions);
            return {
                value: label,
                label,
            };
        });
}

export function getSifatCode(sifat: string): string {
    const sifatMap: Record<string, string> = {
        biasa: 'B',
        terbatas: 'T',
        rahasia: 'R',
        sangat_rahasia: 'SR',
    };

    return sifatMap[sifat] || sifat.toUpperCase();
}
