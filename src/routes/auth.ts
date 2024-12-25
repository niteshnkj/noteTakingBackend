import User from "../models/user";
import { Router, Request, Response } from "express";
import { sendOTP } from "../utils/emailServices";

const authRouter: any = Router();
import crypto from "crypto";

// Utility function to generate a secure OTP
const generateOTP = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); 
};

// Utility function to check OTP expiration
const isOTPExpired = (timestamp: Date): boolean => {
  return Date.now() - new Date(timestamp).getTime() > 10 * 60 * 1000;
};

// Common function to send OTP
const sendUserOTP = async (user: any, otp: string, emailId: string) => {
  user.otp = otp;
  user.isVerified = false;
  await user.save();
  await sendOTP(emailId, otp);
};

// Common function for OTP verification
const verifyUserOTP = async (user: any, otp: string) => {
  if (user.otp !== otp) {
    return { status: 400, message: "Invalid OTP. Please try again." };
  }
  if (isOTPExpired(user.updatedAt)) {
    return { status: 400, message: "OTP expired. Please request a new one." };
  }
  user.isVerified = true;
  user.otp = "";
  await user.save();
  return { status: 200, data: user };
};

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, dob, emailId } = req.body;

    if (!name || !dob || !emailId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Basic email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(emailId)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.isVerified
          ? "User already registered. Please login."
          : "User already exists. Please verify your email.",
      });
    }

    const otp = generateOTP();
    const newUser = new User({ name, emailId, dob, otp, isVerified: false });
    await newUser.save();
    await sendOTP(emailId, otp);

    const { otp: _, ...userWithoutOtp } = newUser.toObject();
    res.status(201).json({
      message: "User registered successfully. Please verify OTP sent to your email.",
      data: userWithoutOtp
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const result = await verifyUserOTP(user, otp);
    if (result.status === 400) {
      return res.status(result.status).json({ message: result.message });
    }
    if(result){
      const generatejwtToken = await user.getJwt();
      res.cookie("token", generatejwtToken, {
        expires: new Date(Date.now() + 86400000),
      })}
    const { otp: _, ...userWithoutOtp } = user.toObject();
    res.status(200).json({
      message: "User verified successfully",
      data: userWithoutOtp,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Send OTP for login
authRouter.post("/signIn", async (req: Request, res: Response) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP();
    await sendUserOTP(user, otp, emailId);
    // const userId: any = user._id;
    // generateToken(userId, user.name, user.emailId, res);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP for login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify OTP and login
authRouter.post("/verify-signInotp", async (req: Request, res: Response) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const result = await verifyUserOTP(user, otp);
    console.log(result);
    if (result.status === 400) {
      return res.status(result.status).json({ message: result.message });
    }
if(result){
    const generatejwtToken = await user.getJwt();
    res.cookie("token", generatejwtToken, {
      expires: new Date(Date.now() + 86400000),
    })}

    const { otp: _, ...userWithoutOtp } = user.toObject();
    res.status(200).json({
      message: "Login successful",
      data: userWithoutOtp,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/logout", (req: Request, res: Response) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).json({ message: "Logged out successfully" });
});

export default authRouter;
