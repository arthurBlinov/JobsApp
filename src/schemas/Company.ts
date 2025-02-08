import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface CompanyInterface extends Document {
  name: string;
  companyId: string;
  email: string;
  telNumber: string;
  password: string;
  isAccountVerified: boolean;
  description: string;
  address: string;
  allJobs: mongoose.Schema.Types.ObjectId;
  ifDeleted: boolean;
  link: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccountVerificationToken(): string;
  isPasswordMatched: (password: string) => Promise<boolean>;
  createAccountVerificationToken: () => Promise<string>;
  createPasswordResetToken: () => Promise<string>;
}

const companySchema: Schema<CompanyInterface> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    companyId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    telNumber: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isAccountVerified: {
      type: Boolean,
      required: false,
      default: false
    },
    description: {
        type: String,
        required: false
    },
    address: {
      type: String,
      required: false
    },
    allJobs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false
    },
    ifDeleted: {
      type: Boolean,
      required: false,
      default: false
    },
    link: {
      type: String,
      required: false
    }
  },
  {
  }
);
companySchema.pre<CompanyInterface>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

companySchema.methods.isPasswordMatched = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

companySchema.methods.createAccountVerificationToken = async function (): Promise<string> {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.accountVerificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
  return verificationToken;
};

companySchema.methods.createPasswordResetToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  return resetToken;
};
companySchema.virtual('company',{
    ref: 'Company',
    foreignField: 'Job',
    localField: 'id',    
})

const Company = mongoose.model<CompanyInterface>("Company", companySchema);
export default Company;