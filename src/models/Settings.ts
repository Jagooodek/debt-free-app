import mongoose, {Schema} from 'mongoose';
import {ISettings} from '@/lib/types';

const SettingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    flatPricePerM2: {
      type: Number,
      required: true,
      default: 11229
    }
  },
  {timestamps: true}
);

export default mongoose.models.Settings ||
mongoose.model<ISettings>('Settings', SettingsSchema);