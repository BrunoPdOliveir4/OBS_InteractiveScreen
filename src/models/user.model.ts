import mongoose, { Schema, Model } from 'mongoose';
import { IUserDocument } from '../types';

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    whitelist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ username: 1 });

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
