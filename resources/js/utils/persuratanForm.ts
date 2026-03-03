interface UserLike {
    id?: string | number;
    name: string;
    jabatan_nama?: string | null;
}

const EXCLUDED_USER_NAMES = new Set(['Sekpri Bupati', 'Sekpri Wakil Bupati']);

export function buildInternalUserOptions(users: UserLike[]) {
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => ({
            value: String(user.id ?? ''),
            label: user.jabatan_nama ? `${user.name} - ${user.jabatan_nama}` : user.name,
        }));
}

export function buildKepadaUserOptions(users: UserLike[]) {
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => ({
            value: user.name,
            label: user.jabatan_nama ? `${user.name} - ${user.jabatan_nama}` : user.name,
        }));
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
