import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

const DashboardShimmer = () => {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isAdmin = user.role === 'superadmin' || user.role === 'tu';

    return (
        <div className="animate-pulse">
            {/* Persuratan Stats Shimmer (First on Admin) */}
            {isAdmin && (
                <div className="mb-8">
                    <div className="h-7 w-32 bg-border-light rounded mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-surface rounded-xl border border-border-default p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-border-light rounded mb-2"></div>
                                        <div className="h-8 w-16 bg-border-light rounded"></div>
                                    </div>
                                    <div className="h-12 w-12 bg-border-light rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Penjadwalan Stats Shimmer */}
            {isAdmin && (
                <div className="mb-8">
                    <div className="h-7 w-32 bg-border-light rounded mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface rounded-xl border border-border-default p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-border-light rounded mb-2"></div>
                                        <div className="h-5 w-24 bg-border-light rounded"></div>
                                    </div>
                                    <div className="h-12 w-12 bg-border-light rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Admin Specific Stats (Wilayah & Master) */}
            {isAdmin && (
                <>
                    <div className="mb-8">
                        <div className="h-7 w-32 bg-border-light rounded mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-surface rounded-xl border border-border-default p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-border-light rounded mb-2"></div>
                                            <div className="h-8 w-16 bg-border-light rounded"></div>
                                        </div>
                                        <div className="h-12 w-12 bg-border-light rounded-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="h-7 w-32 bg-border-light rounded mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-surface rounded-xl border border-border-default p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="h-4 w-24 bg-border-light rounded mb-2"></div>
                                            <div className="h-8 w-16 bg-border-light rounded"></div>
                                        </div>
                                        <div className="h-12 w-12 bg-border-light rounded-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Sekpri Shimmer */}
            {!isAdmin && (
                <div className="mb-8">
                    <div className="h-7 w-32 bg-border-light rounded mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface rounded-xl border border-border-default p-5">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 bg-border-light rounded-lg shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-border-light rounded mb-2"></div>
                                        <div className="h-4 w-full bg-border-light rounded mb-3"></div>
                                        <div className="h-6 w-24 bg-border-light rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardShimmer;
