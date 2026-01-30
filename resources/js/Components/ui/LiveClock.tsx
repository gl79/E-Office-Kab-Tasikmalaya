import { useState, useEffect, memo } from 'react';

interface LiveClockProps {
    className?: string;
}

/**
 * LiveClock Component
 *
 * Menampilkan waktu real-time yang update setiap detik.
 * Menggunakan React.memo untuk mencegah propagasi re-render ke parent component.
 *
 * Format: "Jumat, 31 Januari 2026 - 14:30:25 WIB"
 */
function LiveClockComponent({ className = '' }: LiveClockProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date): string => {
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).replace(/\./g, ':');

        return `${dayName}, ${dateStr} - ${timeStr} WIB`;
    };

    return (
        <div className={className}>
            {formatTime(currentTime)}
        </div>
    );
}

// Wrap dengan React.memo untuk mencegah re-render yang tidak perlu
// Component ini hanya akan re-render ketika props-nya berubah
const LiveClock = memo(LiveClockComponent);

export default LiveClock;
