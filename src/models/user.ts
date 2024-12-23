import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  name: string;
  dob: Date;
  emailId: string;
  otp: string;
  isVerified: boolean;
  createdAt: number; 
  updatedAt: number;
}
const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
  },
  dob: {
    type: Date,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    toLowercase: true,
  },
  otp: {
    type: String,
    default: null,
    required: function(this: IUser) { return !this.isVerified; } // Only require otp if user is not verified
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
},{timestamps:true});

const User = mongoose.model<IUser>("User", userSchema);
export default User;