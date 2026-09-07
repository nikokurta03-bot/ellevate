import Image from 'next/image';

// Crop the original asset in layout; keep the supplied artwork unchanged.
export default function BrandLogo({ large = false, priority = false }: { large?: boolean; priority?: boolean }) {
    return (
        <span className={`brand-logo ${large ? 'brand-logo-large' : ''}`}>
            <Image src="/ellevate_logo.png" alt="Ellevate Fitness Studio" width={842} height={595}
                sizes={large ? '(max-width: 768px) 90vw, 800px' : '280px'} priority={priority} />
        </span>
    );
}
