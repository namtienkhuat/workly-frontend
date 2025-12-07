export const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
        [60, 'second'],
        [60, 'minute'],
        [24, 'hour'],
        [7, 'day'],
        [4.34524, 'week'],
        [12, 'month'],
        [Number.POSITIVE_INFINITY, 'year'],
    ];

    let unit: Intl.RelativeTimeFormatUnit = 'second';
    let relative = diff / 1000;

    for (const [range, nextUnit] of ranges) {
        if (Math.abs(relative) < range) {
            unit = nextUnit;
            break;
        }
        relative /= range;
    }

    return rtf.format(Math.round(relative), unit);
};

export const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
            return `${diffInDays} ngày trước`;
        } else if (diffInHours > 0) {
            return `${diffInHours} giờ trước`;
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} phút trước`;
        } else {
            return 'Vừa xong';
        }
    } catch {
        return dateString;
    }
};

export const formatEndDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = date.getTime() - now.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays < 0) {
            return { text: 'Expired', isExpired: true };
        } else if (diffInDays === 0) {
            return { text: 'Expired today', isExpired: false, isUrgent: true };
        } else if (diffInDays <= 7) {
            return { text: `Remaining ${diffInDays} days`, isExpired: false, isUrgent: true };
        } else {
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            return { text: `Expired: ${formattedDate}`, isExpired: false, isUrgent: false };
        }
    } catch {
        return null;
    }
};
