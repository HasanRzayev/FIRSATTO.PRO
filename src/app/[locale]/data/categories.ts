// data/categories.ts

export interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  export const categories: Category[] = [
    // Vehicles
    { id: 1, name: "Cars", slug: "cars" },
    { id: 2, name: "Motorcycles", slug: "motorcycles" },
    { id: 3, name: "Bicycles", slug: "bicycles" },
    { id: 4, name: "Trucks", slug: "trucks" },
    { id: 5, name: "Spare Parts & Accessories", slug: "car-accessories" },
  
    // Real Estate
    { id: 6, name: "Apartments for Sale", slug: "apartments-sale" },
    { id: 7, name: "Apartments for Rent", slug: "apartments-rent" },
    { id: 8, name: "Houses", slug: "houses" },
    { id: 9, name: "Land / Plots", slug: "land" },
    { id: 10, name: "Commercial Properties", slug: "commercial" },
  
    // Electronics
    { id: 11, name: "Mobile Phones", slug: "mobile-phones" },
    { id: 12, name: "Laptops & Computers", slug: "laptops" },
    { id: 13, name: "Tablets", slug: "tablets" },
    { id: 14, name: "TVs & Video Equipment", slug: "tv-video" },
    { id: 15, name: "Cameras & Photography", slug: "cameras" },
  
    // Home & Garden
    { id: 16, name: "Furniture", slug: "furniture" },
    { id: 17, name: "Home Appliances", slug: "home-appliances" },
    { id: 18, name: "Tools & DIY", slug: "tools" },
    { id: 19, name: "Garden Supplies", slug: "garden" },
    { id: 20, name: "Home Decor", slug: "home-decor" },
  
    // Fashion & Beauty
    { id: 21, name: "Men's Clothing", slug: "mens-clothing" },
    { id: 22, name: "Women's Clothing", slug: "womens-clothing" },
    { id: 23, name: "Shoes", slug: "shoes" },
    { id: 24, name: "Watches & Jewelry", slug: "watches-jewelry" },
    { id: 25, name: "Beauty & Personal Care", slug: "beauty" },
  
    // Baby & Kids
    { id: 26, name: "Baby Clothing", slug: "baby-clothing" },
    { id: 27, name: "Toys", slug: "toys" },
    { id: 28, name: "Strollers & Car Seats", slug: "baby-gear" },
    { id: 29, name: "Baby Furniture", slug: "baby-furniture" },
  
    // Pets
    { id: 30, name: "Dogs", slug: "dogs" },
    { id: 31, name: "Cats", slug: "cats" },
    { id: 32, name: "Birds", slug: "birds" },
    { id: 33, name: "Fish & Aquariums", slug: "fish" },
  
    // Services
    { id: 34, name: "Repair Services", slug: "repair" },
    { id: 35, name: "Cleaning Services", slug: "cleaning" },
    { id: 36, name: "Beauty & Wellness", slug: "wellness" },
    { id: 37, name: "Tutoring & Lessons", slug: "tutoring" },
    { id: 38, name: "Moving Services", slug: "moving" },
  
    // Jobs
    { id: 39, name: "Full-time Jobs", slug: "full-time-jobs" },
    { id: 40, name: "Part-time Jobs", slug: "part-time-jobs" },
    { id: 41, name: "Freelance Jobs", slug: "freelance-jobs" },
    { id: 42, name: "Domestic Jobs", slug: "domestic-jobs" },
  
    // Education
    { id: 43, name: "Courses & Training", slug: "courses" },
    { id: 44, name: "Online Education", slug: "online-education" },
    { id: 45, name: "Language Classes", slug: "language-classes" },
  
    // Business & Industrial
    { id: 46, name: "Industrial Equipment", slug: "industrial" },
    { id: 47, name: "Business for Sale", slug: "business-sale" },
    { id: 48, name: "Wholesale Products", slug: "wholesale" },
  
    // Others
    { id: 49, name: "Free Items", slug: "free" },
    { id: 50, name: "Lost & Found", slug: "lost-found" },
    { id: 51, name: "Announcements", slug: "announcements" },
    { id: 52, name: "Other", slug: "other" },
  ];
  