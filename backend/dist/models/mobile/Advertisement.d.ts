import mongoose, { Document } from 'mongoose';
export declare enum AdvertisementType {
    LOST = "lost",
    FOUND = "found"
}
export declare enum ItemCategory {
    PASSPORT = "passport",
    NATIONAL_ID = "national_id",
    DRIVING_LICENSE = "driving_license",
    OTHER = "other"
}
export declare enum Governorate {
    BAGHDAD = "baghdad",
    BASRA = "basra",
    ERBIL = "erbil",
    SULAYMANIYAH = "sulaymaniyah",
    DUHOK = "duhok",
    NINEVEH = "nineveh",
    KIRKUK = "kirkuk",
    DIYALA = "diyala",
    ANBAR = "anbar",
    BABIL = "babil",
    KARBALA = "karbala",
    NAJAF = "najaf",
    WASIT = "wasit",
    MUTHANNA = "muthanna",
    DIWANIYAH = "diwaniyah",
    MAYSAN = "maysan",
    DHIQAR = "dhiqar",
    SALADIN = "saladin"
}
export declare enum AdvertisementStatus {
    PENDING = "pending",// في انتظار الموافقة
    APPROVED = "approved",// تمت الموافقة
    REJECTED = "rejected",// مرفوض
    RESOLVED = "resolved"
}
export interface IAdvertisement extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: AdvertisementType;
    category: ItemCategory;
    governorate: Governorate;
    ownerName?: string;
    itemNumber?: string;
    description: string;
    images: string[];
    location?: {
        type: string;
        coordinates: number[];
    };
    contactPhone: string;
    status: AdvertisementStatus;
    isApproved: boolean;
    approvedAt?: Date;
    approvedBy?: mongoose.Schema.Types.ObjectId;
    rejectionReason?: string;
    isResolved: boolean;
    resolvedAt?: Date;
    hideContactInfo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Advertisement: mongoose.Model<IAdvertisement, {}, {}, {}, mongoose.Document<unknown, {}, IAdvertisement> & IAdvertisement & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Advertisement;
//# sourceMappingURL=Advertisement.d.ts.map