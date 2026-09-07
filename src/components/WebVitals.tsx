'use client';

import { useReportWebVitals } from 'next/web-vitals';

function report(metric: { name: string; value: number }) {
    if (!['LCP', 'INP', 'CLS'].includes(metric.name)) return;
    const pathname = window.location.pathname;
    const page = pathname === '/' || pathname === '/blog' ? pathname : pathname.startsWith('/blog/') ? '/blog/article' : null;
    if (!page) return;
    // Only three numeric measurements and a public page category; no user, query,
    // article slug, metric identifier or private route data is sent.
    const payload = { name: metric.name, value: metric.value, page };
    if (new URLSearchParams(window.location.search).get('measure') === '1') console.info('Ellevate web vitals', JSON.stringify(payload));
    navigator.sendBeacon('/api/web-vitals', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
}

export default function WebVitals() {
    useReportWebVitals(report);
    return null;
}
