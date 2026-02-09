
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAd extends Document {
    userId: string; // Reference to User's _id (Supabase UUID)
    title: string;
    description: string;
    category: string;
    imageUrls: string[];
    videoUrls: string[];
    location: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

const AdSchema: Schema = new Schema(
    {
        userId: { type: String, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        imageUrls: { type: [String], default: [] },
        videoUrls: { type: [String], default: [] },
        location: { type: String, required: true },
        price: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

// Indexes for better search performance
AdSchema.index({ title: 'text', description: 'text', location: 'text' });
AdSchema.index({ category: 1 });
AdSchema.index({ price: 1 });

const Ad: Model<IAd> = mongoose.models.Ad || mongoose.model<IAd>('Ad', AdSchema);

export default Ad;
