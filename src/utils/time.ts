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
