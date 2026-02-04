import React from 'react';

interface Props {
    activeTab: 'menunggu' | 'sudah';
    onTabChange: (tab: 'menunggu' | 'sudah') => void;
    countMenunggu: number;
    countSudah: number;
}

const TentatifTabNav: React.FC<Props> = ({ activeTab, onTabChange, countMenunggu, countSudah }) => {
    return (
        <div className="border-b border-border-default">
            <nav className="flex -mb-px">
                <button
                    onClick={() => onTabChange('menunggu')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'menunggu'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                        }`}
                >
                    Menunggu Peninjauan
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning-light text-warning">
                        {countMenunggu}
                    </span>
                </button>
                <button
                    onClick={() => onTabChange('sudah')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sudah'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-dark'
                        }`}
                >
                    Sudah Ditinjau
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-success-light text-success">
                        {countSudah}
                    </span>
                </button>
            </nav>
        </div>
    );
};

export default TentatifTabNav;
