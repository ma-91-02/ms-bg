import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  category: {
    type: String,
    enum: ['id', 'passport', 'driving_license', 'credit_card', 'phone', 'electronics', 'jewelry', 'bag', 'clothing', 'money', 'keys', 'pet', 'other'],
    required: true
  },
  documentType: {
    type: String,
    enum: ['national_id', 'passport', 'driving_license', 'residence_card', 'credit_card', 'health_insurance', 'student_id', 'employee_id', 'other'],
    required: function() {
      return this.category === 'id' || this.category === 'passport' || this.category === 'driving_license' || this.category === 'credit_card';
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'العنوان لا يمكن أن يتجاوز 100 حرف']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرف']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  governorate: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'closed', 'claimed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// إضافة فهرس جغرافي لدعم استعلامات الموقع
reportSchema.index({ location: '2dsphere' });

// إضافة فهرس للبحث النصي
reportSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: {
    title: 2,
    description: 1
  },
  name: 'text_search_index'
});

const Report = mongoose.model('Report', reportSchema);

export default Report; 