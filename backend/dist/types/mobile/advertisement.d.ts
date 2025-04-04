export declare enum AdvertisementType {
    LOST = "lost",
    FOUND = "found"
}
export declare enum AdvertisementStatus {
    PENDING = "pending",
    ACTIVE = "active",
    RESOLVED = "resolved",
    REJECTED = "rejected"
}
export interface CreateAdvertisementDTO {
    title: string;
    description: string;
    type: AdvertisementType;
    category: string;
    location?: {
        type: string;
        coordinates: number[];
        address?: string;
        governorate?: string;
    };
    date?: Date;
    contactInfo: {
        phone?: string;
        email?: string;
        name?: string;
    };
    reward?: number;
}
export interface UpdateAdvertisementDTO {
    title?: string;
    description?: string;
    category?: string;
    location?: {
        type: string;
        coordinates: number[];
        address?: string;
        governorate?: string;
    };
    date?: Date;
    contactInfo?: {
        phone?: string;
        email?: string;
        name?: string;
    };
    reward?: number;
    status?: AdvertisementStatus;
}
export interface AdvertisementFilters {
    type?: AdvertisementType;
    category?: string;
    status?: AdvertisementStatus;
    search?: string;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=advertisement.d.ts.map