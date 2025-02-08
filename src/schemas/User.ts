import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JobInterface } from './Job';

export interface UserInterface extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  role: 'Admin' | 'Free' | 'PayAsYouGo' | 'Monthly' | 'Exclusive';
  isAccountVerified: boolean;
  accountVerificationToken?: string;
  accountVerificationTokenExpires?: Date;
  viewedBy: mongoose.Types.ObjectId[];
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  history: mongoose.Types.Array<JobInterface>;
  cvs: mongoose.Types.Array<Buffer>,
  expiresDate?: Date,
  sendingCounter: Number,
  ifDeleted: Boolean, 
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccountVerificationToken(): string;
  isPasswordMatched: (password: string) => Promise<boolean>;
  createAccountVerificationToken: () => Promise<string>;
  createPasswordResetToken: () => Promise<string>;
}

const userSchema: Schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Free', 'PayAsYouGo', 'Monthly', 'Exclusive'],
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    accountVerificationToken: {
      type: String,
    },
    accountVerificationTokenExpires: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    history: {
      type: Array<JobInterface>,
      required: false,
      default: []
    },
    cvs: {
      type: [Buffer],
      default: [],
    },
    expiresDate: {
      type: Date,
      required: false
    },
    sendindCounter:{
      type: Number,
      required: true,
      default: 0
    },
    ifDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

userSchema.pre<UserInterface>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createAccountVerificationToken = async function (): Promise<string> {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.accountVerificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
  return verificationToken;
};

userSchema.methods.createPasswordResetToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  return resetToken;
};
const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
