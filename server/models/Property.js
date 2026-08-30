const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['house', 'apartment', 'duplex', 'villa', 'office', 'commercial', 'land', 'shop'],
    },
    listingType: {
      type: String,
      required: true,
      enum: ['sale', 'rent'],
    },
    address: { type: String, required: [true, 'Address is required'] },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    country: { type: String, required: true, default: 'Nigeria', trim: true },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    parkingSpaces: { type: Number, default: 0, min: 0 },
    area: { type: Number, required: [true, 'Area is required'], min: 0 },
    yearBuilt: { type: Number },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    amenities: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold', 'rented'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String, default: '' },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', city: 'text', state: 'text', address: 'text' });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ city: 1, state: 1 });
propertySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);
