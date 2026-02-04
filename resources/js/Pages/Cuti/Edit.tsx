import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CutiForm from './Components/CutiForm';
import type { PageProps } from '@/types';
import type { CutiItem } from '@/types/cuti';

interface UserOption {
    id: number;
    name: string;
    nip?: string | null;
    jabatan?: string | null;
}

interface Props extends PageProps {
    cuti: CutiItem;
    users: UserOption[];
    jenisCutiOptions: string[];
}

const Edit = ({ cuti, users, jenisCutiOptions }: Props) => {
    const { data, setData, put, processing, errors } = useForm({
        user_id: cuti.pegawai?.id ? String(cuti.pegawai.id) : '',
        atasan_id: cuti.atasan?.id ? String(cuti.atasan.id) : '',
        jenis_cuti: cuti.jenis_cuti || '',
        alasan_cuti: cuti.alasan_cuti || '',
        lama_cuti: cuti.lama_cuti || '',
        tanggal_mulai: cuti.tanggal_mulai || '',
        tanggal_selesai: cuti.tanggal_selesai || '',
        alamat_cuti: cuti.alamat_cuti || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('cuti.update', cuti.id));
    };

    return (
        <>
            <Head title="Edit Cuti" />
            <CutiForm
                title="Edit Cuti"
                description="Perbarui data pengajuan cuti yang masih pending"
                users={users}
                jenisCutiOptions={jenisCutiOptions}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                submitLabel="Simpan Perubahan"
                cancelHref={route('cuti.index')}
            />
        </>
    );
};

Edit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Edit;
