import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import Ad from '../../../models/Ad';
import User from '../../../models/User';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const searchTerm = searchParams.get('q');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        let query: any = {};

        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (location) {
            // Simple exact match or contains check for location if selected from dropdown
            query.location = { $regex: location, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const ads = await Ad.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'userId', // Use the foreign key we defined in Ad model (userId -> User._id)
                model: User,
                select: 'full_name profile_picture'
            });

        // Transform data to match frontend expectations (user_profiles structure)
        const transformedAds = ads.map(ad => {
            const adObj = ad.toObject();
            return {
                ...adObj,
                id: adObj._id.toString(), // Ensure ID is string
                user_profiles: adObj.userId ? {
                    id: (adObj.userId as any)._id,
                    full_name: (adObj.userId as any).full_name,
                    profile_picture: (adObj.userId as any).profile_picture
                } : null,
                // Map Mongoose timestamp fields if needed
                created_at: adObj.createdAt,
                updated_at: adObj.updatedAt
            };
        });

        return NextResponse.json(transformedAds);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
