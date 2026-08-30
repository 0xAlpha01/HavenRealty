const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'closed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

inquirySchema.index({ owner: 1, createdAt: -1 });
inquirySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
