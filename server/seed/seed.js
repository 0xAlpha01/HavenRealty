const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const Inquiry = require('../models/Inquiry');
const Message = require('../models/Message');

// Stable, direct Unsplash CDN photo IDs (source.unsplash.com's random-redirect
// service was shut down and now returns 503 for every request, so we pin to
// specific known-good photos instead).
const PROPERTY_PHOTO_IDS = [
  'photo-1600585154340-be6161a56a0c',
  'photo-1560518883-ce09059eeffa',
  'photo-1512917774080-9991f1c4c750',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1613977257363-707ba9348227',
  'photo-1580587771525-78b9dba3b914',
  'photo-1568605114967-8130f3a36994',
  'photo-1570129477492-45c003edd2be',
  'photo-1583608205776-bfd35f0d9f83',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1416331108676-a22ccb276e35',
  'photo-1523217582562-09d0def993a6',
  'photo-1524230572899-a752b3835840',
  'photo-1502005229762-cf1b2da7c5d6',
  'photo-1494203484021-3c454daf695d',
  'photo-1522708323590-d24dbb6b0267',
  'photo-1484154218962-a197022b5858',
  'photo-1615873968403-89e068629265',
  'photo-1615529182904-14819c35db37',
];

const propertyImage = (index) => {
  const photoId = PROPERTY_PHOTO_IDS[index % PROPERTY_PHOTO_IDS.length];
  return {
    url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`,
    publicId: '',
  };
};

const AGENTS = [
  {
    fullName: 'Adaeze Okafor',
    email: 'adaeze.okafor@example.com',
    phone: '+2348012345001',
    password: 'password123',
    role: 'agent',
    isAgent: true,
    bio: 'Senior real estate consultant specializing in Lagos Island luxury properties with over 8 years of experience.',
    location: 'Lagos, Nigeria',
  },
  {
    fullName: 'Chidi Eze',
    email: 'chidi.eze@example.com',
    phone: '+2348012345002',
    password: 'password123',
    role: 'agent',
    isAgent: true,
    bio: 'Helping families find affordable homes across Lagos mainland for over 6 years.',
    location: 'Lagos, Nigeria',
  },
  {
    fullName: 'Fatima Bello',
    email: 'fatima.bello@example.com',
    phone: '+2348012345003',
    password: 'password123',
    role: 'agent',
    isAgent: true,
    bio: 'Commercial and residential property specialist based in Abuja.',
    location: 'Abuja, Nigeria',
  },
  {
    fullName: 'Tunde Bakare',
    email: 'tunde.bakare@example.com',
    phone: '+2348012345004',
    password: 'password123',
    role: 'agent',
    isAgent: true,
    bio: 'Land and commercial property expert with deep knowledge of the Lagos market.',
    location: 'Lagos, Nigeria',
  },
  {
    fullName: 'Ngozi Umeh',
    email: 'ngozi.umeh@example.com',
    phone: '+2348012345005',
    password: 'password123',
    role: 'agent',
    isAgent: true,
    bio: 'Rental specialist focused on modern apartments for young professionals.',
    location: 'Lagos, Nigeria',
  },
];

const PROPERTY_TEMPLATES = [
  {
    title: 'Modern 3 Bedroom Apartment',
    propertyType: 'apartment',
    listingType: 'rent',
    price: 4500000,
    city: 'Lekki',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 8,
    area: 250,
    yearBuilt: 2021,
    description:
      'A stunning modern 3 bedroom apartment in the heart of Lekki Phase 1, featuring open-plan living, high-end finishes, and 24/7 security.',
    amenities: ['24/7 Security', 'Swimming Pool', 'Gym', 'Backup Power', 'Parking'],
    features: ['Fitted Kitchen', 'Air Conditioning', 'Balcony'],
    isFeatured: true,
  },
  {
    title: 'Luxury 5 Bedroom Duplex with BQ',
    propertyType: 'duplex',
    listingType: 'sale',
    price: 185000000,
    city: 'Ikoyi',
    state: 'Lagos',
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 4,
    area: 520,
    yearBuilt: 2020,
    description:
      'An exquisite 5 bedroom duplex with boys quarters in a serene Ikoyi neighborhood, perfect for discerning families.',
    amenities: ['24/7 Security', 'Backup Power', 'Water Treatment Plant', 'CCTV'],
    features: ['Fitted Kitchen', 'Walk-in Closet', 'En-suite Rooms'],
    isFeatured: true,
  },
  {
    title: 'Elegant 4 Bedroom Terrace House',
    propertyType: 'house',
    listingType: 'sale',
    price: 95000000,
    city: 'Victoria Island',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    area: 380,
    yearBuilt: 2019,
    description:
      'A beautifully designed terrace house located in the prestigious Victoria Island area, close to major business hubs.',
    amenities: ['24/7 Security', 'Elevator', 'Backup Power', 'Parking'],
    features: ['Fitted Kitchen', 'Family Lounge', 'Guest Toilet'],
    isFeatured: true,
  },
  {
    title: 'Cozy 2 Bedroom Flat',
    propertyType: 'apartment',
    listingType: 'rent',
    price: 1800000,
    city: 'Yaba',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    area: 110,
    yearBuilt: 2017,
    description:
      'A comfortable 2 bedroom flat close to tech hubs and universities in Yaba, ideal for young professionals.',
    amenities: ['Security', 'Water Supply', 'Parking'],
    features: ['Tiled Floors', 'Kitchen Cabinets'],
    isFeatured: false,
  },
  {
    title: 'Executive 3 Bedroom Bungalow',
    propertyType: 'house',
    listingType: 'sale',
    price: 65000000,
    city: 'Ikeja',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    area: 300,
    yearBuilt: 2018,
    description:
      'A spacious executive bungalow with a large compound, situated in a quiet estate in Ikeja GRA.',
    amenities: ['24/7 Security', 'Backup Power', 'Garden'],
    features: ['Fitted Kitchen', 'Store Room'],
    isFeatured: false,
  },
  {
    title: 'Contemporary 4 Bedroom Villa',
    propertyType: 'villa',
    listingType: 'sale',
    price: 220000000,
    city: 'Ikoyi',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    area: 600,
    yearBuilt: 2022,
    description:
      'A contemporary villa with a private pool and landscaped garden, offering the finest luxury living in Ikoyi.',
    amenities: ['Swimming Pool', '24/7 Security', 'Gym', 'CCTV', 'Backup Power'],
    features: ['Smart Home System', 'Cinema Room', 'Wine Cellar'],
    isFeatured: true,
  },
  {
    title: 'Prime Office Space',
    propertyType: 'office',
    listingType: 'rent',
    price: 12000000,
    city: 'Victoria Island',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 2,
    parkingSpaces: 10,
    area: 450,
    yearBuilt: 2016,
    description:
      'Grade A office space in a prime Victoria Island business district, suitable for corporate headquarters.',
    amenities: ['Elevator', '24/7 Security', 'Backup Power', 'Central AC'],
    features: ['Open Floor Plan', 'Conference Rooms', 'Reception Area'],
    isFeatured: false,
  },
  {
    title: 'Retail Shop Space',
    propertyType: 'shop',
    listingType: 'rent',
    price: 2500000,
    city: 'Surulere',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 1,
    parkingSpaces: 2,
    area: 65,
    yearBuilt: 2015,
    description:
      'A well-located retail shop on a busy Surulere road with excellent foot traffic.',
    amenities: ['Security', 'Water Supply'],
    features: ['Roller Shutters', 'Storage Space'],
    isFeatured: false,
  },
  {
    title: 'Commercial Plaza',
    propertyType: 'commercial',
    listingType: 'sale',
    price: 350000000,
    city: 'Ajah',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 6,
    parkingSpaces: 20,
    area: 1200,
    yearBuilt: 2014,
    description:
      'A fully occupied commercial plaza in the fast-growing Ajah axis, with multiple retail units and steady tenants.',
    amenities: ['24/7 Security', 'Backup Power', 'CCTV', 'Ample Parking'],
    features: ['Multiple Units', 'Signage Space'],
    isFeatured: false,
  },
  {
    title: '600 sqm Residential Land',
    propertyType: 'land',
    listingType: 'sale',
    price: 45000000,
    city: 'Ajah',
    state: 'Lagos',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    area: 600,
    yearBuilt: undefined,
    description:
      'A dry, fenced 600 sqm plot of land with governor\'s consent, ready for immediate development.',
    amenities: ['Fenced', 'Gated Estate'],
    features: ['Corner Piece', 'Dry Land'],
    isFeatured: false,
  },
  {
    title: 'Spacious 6 Bedroom Mansion',
    propertyType: 'house',
    listingType: 'sale',
    price: 480000000,
    city: 'Ikoyi',
    state: 'Lagos',
    bedrooms: 6,
    bathrooms: 7,
    parkingSpaces: 6,
    area: 850,
    yearBuilt: 2021,
    description:
      'A grand 6 bedroom mansion with expansive entertainment areas, situated on a quiet Ikoyi crescent.',
    amenities: ['Swimming Pool', '24/7 Security', 'Gym', 'Cinema Room', 'Backup Power'],
    features: ['Smart Home System', 'Elevator', 'Staff Quarters'],
    isFeatured: true,
  },
  {
    title: 'Affordable 1 Bedroom Studio',
    propertyType: 'apartment',
    listingType: 'rent',
    price: 900000,
    city: 'Gbagada',
    state: 'Lagos',
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 1,
    area: 55,
    yearBuilt: 2019,
    description:
      'A tidy 1 bedroom studio apartment perfect for singles, located close to the Gbagada expressway.',
    amenities: ['Security', 'Water Supply'],
    features: ['Tiled Floors', 'Fitted Kitchenette'],
    isFeatured: false,
  },
  {
    title: 'Waterfront 4 Bedroom Apartment',
    propertyType: 'apartment',
    listingType: 'sale',
    price: 150000000,
    city: 'Lagos Island',
    state: 'Lagos',
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    area: 400,
    yearBuilt: 2020,
    description:
      'A luxurious waterfront apartment with panoramic lagoon views, located on Lagos Island.',
    amenities: ['Swimming Pool', '24/7 Security', 'Gym', 'Waterfront View'],
    features: ['Floor to Ceiling Windows', 'Private Jetty Access'],
    isFeatured: true,
  },
  {
    title: 'Modern 3 Bedroom Terrace Duplex',
    propertyType: 'duplex',
    listingType: 'rent',
    price: 6500000,
    city: 'Lekki',
    state: 'Lagos',
    bedrooms: 3,
    bathrooms: 4,
    parkingSpaces: 2,
    area: 240,
    yearBuilt: 2020,
    description:
      'A modern terrace duplex within a gated estate in Lekki, offering a family-friendly environment.',
    amenities: ['24/7 Security', 'Playground', 'Backup Power'],
    features: ['Fitted Kitchen', 'Balcony'],
    isFeatured: false,
  },
  {
    title: 'Government Reserved Area Bungalow',
    propertyType: 'house',
    listingType: 'sale',
    price: 320000000,
    city: 'Abuja',
    state: 'FCT',
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 5,
    area: 700,
    yearBuilt: 2018,
    description:
      'An impressive 5 bedroom bungalow in Maitama GRA, Abuja, with a beautifully manicured garden.',
    amenities: ['24/7 Security', 'Backup Power', 'Garden', 'CCTV'],
    features: ['Fitted Kitchen', 'Study Room', 'Staff Quarters'],
    isFeatured: true,
  },
  {
    title: 'Serviced 2 Bedroom Apartment',
    propertyType: 'apartment',
    listingType: 'rent',
    price: 3200000,
    city: 'Ikeja',
    state: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    area: 130,
    yearBuilt: 2021,
    description:
      'A fully serviced 2 bedroom apartment with housekeeping and maintenance included, in Ikeja GRA.',
    amenities: ['24/7 Security', 'Housekeeping', 'Backup Power', 'Gym'],
    features: ['Furnished', 'Air Conditioning'],
    isFeatured: false,
  },
];

const seedDatabase = async () => {
  await connectDB();

  const shouldDestroy = process.argv.includes('--destroy');

  await Promise.all([
    User.deleteMany(),
    Property.deleteMany(),
    Favorite.deleteMany(),
    Inquiry.deleteMany(),
    Message.deleteMany(),
  ]);

  console.log('Existing data cleared.');

  if (shouldDestroy) {
    console.log('Database destroyed successfully.');
    process.exit(0);
  }

  const admin = await User.create({
    fullName: process.env.ADMIN_NAME || 'Platform Admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    phone: process.env.ADMIN_PHONE || '+2348000000000',
    password: process.env.ADMIN_PASSWORD || 'change-me-now',
    role: 'admin',
    phoneVerified: true,
  });
  console.log(`Admin created: ${admin.email}`);

  // Created one-by-one via .create() (not insertMany) so each document runs
  // through the pre('save') hook that hashes the password - insertMany
  // bypasses Mongoose middleware and would silently store plaintext passwords.
  const agents = await Promise.all(
    AGENTS.map((agent) => User.create({ ...agent, phoneVerified: true }))
  );
  console.log(`${agents.length} agents created.`);

  const properties = PROPERTY_TEMPLATES.map((template, index) => {
    const owner = agents[index % agents.length];
    const imageCount = 3 + (index % 3);
    const images = Array.from({ length: imageCount }, (_, i) => propertyImage(index * 3 + i));

    return {
      ...template,
      country: 'Nigeria',
      address: `${10 + index} ${template.city} Road`,
      owner: owner._id,
      images,
      status: 'approved',
      views: Math.floor(Math.random() * 500),
    };
  });

  const createdProperties = await Property.insertMany(properties);
  console.log(`${createdProperties.length} properties created.`);

  console.log('\nSeed completed successfully.');
  console.log('----------------------------------------');
  console.log(`Admin login -> email: ${admin.email} | password: ${process.env.ADMIN_PASSWORD || 'change-me-now'}`);
  console.log('Agent login (any) -> password: password123');
  agents.forEach((agent) => console.log(`  - ${agent.email}`));
  console.log('----------------------------------------');

  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error('Seed failed:', error);
  mongoose.connection.close();
  process.exit(1);
});
