import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  text: string;
  link?: string;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    text: {
      type: String,
      required: [true, 'Announcement text is required'],
      trim: true,
      maxlength: [500, 'Announcement cannot be more than 500 characters'],
    },
    link: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IAnnouncement, value: Date) {
          return !this.startDate || !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Announcement || 
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
