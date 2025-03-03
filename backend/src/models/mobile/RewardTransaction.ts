import mongoose, { Schema, Document } from 'mongoose';

export interface IRewardTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  points: number;
  type: string;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

const RewardTransactionSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['contact_confirm', 'document_returned', 'create_document', 'report_invalid', 'monthly_active', 'redeem_reward'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model<IRewardTransaction>('RewardTransaction', RewardTransactionSchema); 