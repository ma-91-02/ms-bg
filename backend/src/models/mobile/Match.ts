import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  // المستخدم الذي أبلغ عن الضياع
  lostReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  // المستخدم الذي عثر على الشيء
  foundReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  // حالة المطابقة
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  // نسبة التطابق (0-100)
  matchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // تاريخ إنشاء المطابقة
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);

export default Match; 