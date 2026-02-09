
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    _id: string; // Using Supabase Auth ID as _id
    full_name: string;
    username?: string;
    bio?: string;
    location?: string;
    birth_date?: Date;
    profile_picture?: string;
    is_expert: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        _id: { type: String, required: true }, // Explicitly set _id to be a string (UUID from Supabase)
        full_name: { type: String, required: true },
        username: { type: String, unique: true, sparse: true },
        bio: { type: String },
        location: { type: String },
        birth_date: { type: Date },
        profile_picture: { type: String },
        is_expert: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        _id: false, // Disable auto-generation of _id since we use Supabase UUID
    }
);

// Check if model already exists to prevent overwrite during hot reloads
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
