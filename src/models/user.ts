import mongoose, { Document, Schema, Model } from "mongoose";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  name: string;
  dob: Date;
  emailId: string;
  otp: string | null;
  isVerified: boolean;
  createdAt: Date; 
  updatedAt: Date;
  getJwt(): Promise<string>; // Add method signature for `getJwt`
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, 
    },
    otp: {
      type: String,
      default: null,
      required: function (this: IUser) {
        return !this.isVerified; 
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


userSchema.methods.getJwt = async function (): Promise<string> {
  const user = this as IUser; 
  const token = jwt.sign({ _id: user._id }, "NOTEMAKING$435", {
    expiresIn: "1d",
  });
  return token;
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
