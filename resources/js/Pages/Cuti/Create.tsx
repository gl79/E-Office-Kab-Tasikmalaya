import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CutiForm from './Components/CutiForm';
import type { PageProps } from '@/types';

interface UserOption {
    id: number;
    name: string;
    nip?: string | null;
    jabatan?: string | null;
}

interface Props extends PageProps {
    users: UserOption[];
    jenisCutiOptions: string[];
}

const Create = ({ users, jenisCutiOptions }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        atasan_id: '',
        jenis_cuti: '',
        alasan_cuti: '',
        lama_cuti: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        alamat_cuti: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cuti.store'));
    };

    return (
        <>
            <Head title="Tambah Cuti" />
            <CutiForm
                title="Tambah Cuti"
                description="Lengkapi form pengajuan cuti berikut"
                users={users}
                jenisCutiOptions={jenisCutiOptions}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                submitLabel="Simpan Pengajuan"
                cancelHref={route('cuti.index')}
            />
        </>
    );
};

Create.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Create;
