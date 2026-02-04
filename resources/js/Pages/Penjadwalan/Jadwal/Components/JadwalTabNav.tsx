import React from 'react';

interface Props {
    activeTab: 'belum' | 'sudah';
    onTabChange: (tab: 'belum' | 'sudah') => void;
    countBelum: number;
    countSudah: number;
}

const JadwalTabNav: React.FC<Props> = ({ activeTab, onTabChange, countBelum, countSudah }) => {
    return (
        <div className="border-b border-border-default">
            <nav className="flex -mb-px">
                <button
                    onClick={() => onTabChange('belum')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'belum'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                        }`}
                >
                    Belum Dijadwalkan
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning-light text-warning">
                        {countBelum}
                    </span>
                </button>
                <button
                    onClick={() => onTabChange('sudah')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sudah'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                        }`}
                >
                    Sudah Dijadwalkan
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-success-light text-success">
                        {countSudah}
                    </span>
                </button>
            </nav>
        </div>
    );
};

export default JadwalTabNav;
