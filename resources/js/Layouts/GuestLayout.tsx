import { ApplicationLogo } from '@/Components/form';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect } from 'react';
import { ToastProvider, useToast } from '@/Components/ui';
import { PageProps } from '@/types';

export default function Guest({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps & { flash: { success?: string; error?: string } }>().props;
    const { showToast } = useToast();

    useEffect(() => {
        if (flash?.success) {
            showToast('success', flash.success);
        }
        if (flash?.error) {
            showToast('error', flash.error);
        }
    }, [flash]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
