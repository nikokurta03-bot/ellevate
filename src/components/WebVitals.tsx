'use client';

import { useReportWebVitals } from 'next/web-vitals';

const report: Parameters<typeof useReportWebVitals>[0] = (metric) => {
    if (!['LCP', 'INP', 'CLS'].includes(metric.name)) return;
    const pathname = window.location.pathname;
    const page = pathname === '/' || pathname === '/blog' ? pathname : pathname.startsWith('/blog/') ? '/blog/article' : null;
    if (!page) return;
    // Only three numeric measurements and a public page category; no user, query,
    // article slug, metric identifier or private route data is sent.
    const payload = { name: metric.name, value: metric.value, page };
    if (new URLSearchParams(window.location.search).get('measure') === '1') {
        const entry = metric.entries.at(-1) as (PerformanceEntry & { element?: Element }) | undefined;
        console.info('Ellevate web vitals', JSON.stringify({ ...payload, element: entry?.element?.tagName }));
    }
    navigator.sendBeacon('/api/web-vitals', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
}

export default function WebVitals() {
    useReportWebVitals(report);
    return null;
}
