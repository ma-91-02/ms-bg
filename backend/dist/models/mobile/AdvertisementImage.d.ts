import mongoose, { Document } from 'mongoose';
export interface IAdvertisementImage extends Document {
    advertisementId: mongoose.Types.ObjectId;
    imageUrl: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAdvertisementImage, {}, {}, {}, mongoose.Document<unknown, {}, IAdvertisementImage> & IAdvertisementImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AdvertisementImage.d.ts.map