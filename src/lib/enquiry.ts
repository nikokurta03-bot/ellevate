export type Enquiry = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    requestId: string;
};

export function parseEnquiry(value: unknown): Enquiry | null {
    if (!value || typeof value !== 'object') return null;
    const input = value as Record<string, unknown>;
    if (typeof input.firstName !== 'string' || typeof input.lastName !== 'string' || typeof input.email !== 'string' || typeof input.requestId !== 'string') return null;
    if (input.phone !== undefined && typeof input.phone !== 'string') return null;
    if (input.message !== undefined && typeof input.message !== 'string') return null;
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = (input.phone as string | undefined)?.trim() ?? '';
    const message = (input.message as string | undefined)?.trim() ?? '';
    if (!firstName || firstName.length > 80 || /[\r\n\x00]/.test(firstName)) return null;
    if (!lastName || lastName.length > 80 || /[\r\n\x00]/.test(lastName)) return null;
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    if (phone.length > 32 || (phone && !/^[+\d\s()./-]+$/.test(phone))) return null;
    if (message.length > 2000) return null;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) return null;
    return { firstName, lastName, email, phone, message, requestId: input.requestId };
}

export function enquiryMessage(enquiry: Enquiry) {
    return {
        subject: 'Novi upit za članstvo — Ellevate',
        replyTo: enquiry.email,
        text: [
            'Novi upit putem web stranice Ellevate',
            '',
            `Ime: ${enquiry.firstName}`,
            `Prezime: ${enquiry.lastName}`,
            `E-mail: ${enquiry.email}`,
            `Telefon: ${enquiry.phone || 'Nije naveden'}`,
            '',
            'Poruka:',
            enquiry.message || 'Nema dodatne poruke.',
            '',
            'Ovo je upit za članstvo, bez kreiranja računa ili rezervacije treninga.',
        ].join('\n'),
    };
}
