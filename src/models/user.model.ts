import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface Address {
  buildingName?: string;
  locality: string;
  wardNo?: string;
  postalCode: string;
  district: string;
  province: string;
  country: string;
  landmark?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // This allows null/undefined values to not be considered in the uniqueness constraint
      validate: {
        validator: function(v: string) {
          // Basic validation for international phone numbers
          return /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: props => `${props.value} is not a valid international phone number!`
      }
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in query results
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: String,
    address: {
      buildingName: String,
      locality: String,
      wardNo: String,
      postalCode: String,
      district: String,
      province: String,
      country: { type: String, default: 'Nepal' },
      landmark: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Delete password when converting to JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

// Create indexes for login
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
