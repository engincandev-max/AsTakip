export interface Visit {
    id: string;
    customerId: string;
    date: string;
    note?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
}

export interface LocationPin {
    name: string;
    lat: number;
    lng: number;
}

export interface Attachment {
    id: number;
    filename: string;
    originalName: string;
    mimetype: string;
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    phoneNumber: string;
    additionalPhones?: string[];
    locations?: LocationPin[];
    constructionType?: string;
    stage?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    createdByUsername?: string;
    visits?: Visit[];
    attachments?: Attachment[];
}

export interface CreateCustomerDto {
    name: string;
    phoneNumber: string;
    additionalPhones?: string[];
    locations?: LocationPin[];
    constructionType?: string;
    stage?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface CreateVisitDto {
    customerId: string;
    date: string;
    note?: string;
    latitude?: number;
    longitude?: number;
}
