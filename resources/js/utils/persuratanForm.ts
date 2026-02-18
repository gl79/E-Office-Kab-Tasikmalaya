interface UserLike {
    id?: string | number;
    name: string;
    nip?: string | null;
    jabatan?: string | null;
}

const EXCLUDED_USER_NAMES = new Set(['Sekpri Bupati', 'Sekpri Wakil Bupati']);

export function buildInternalUserOptions(users: UserLike[]) {
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => ({
            value: String(user.id ?? ''),
            label: user.nip ? `${user.name} (${user.nip})` : user.name,
        }));
}

export function buildKepadaUserOptions(users: UserLike[]) {
    return users
        .filter((user) => !EXCLUDED_USER_NAMES.has(user.name))
        .map((user) => ({
            value: user.name,
            label: user.jabatan ? `${user.name} - ${user.jabatan}` : user.name,
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
