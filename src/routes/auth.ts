import User from "../models/user";
import { Router, Request, Response } from "express";
import { sendOTP } from "../utils/emailServices";
import generateToken from "../utils/generateToken";
const authRouter: any = Router();
import crypto from "crypto";
  // assuming email sending logic is moved here

// Utility function to generate a secure OTP
const generateOTP = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates a 6-character OTP
};

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, dob, emailId } = req.body;

    // Basic validation
    if (!name || !dob || !emailId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation (basic)
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

    // Generate a secure OTP
    const otp = generateOTP();
    const newUser = new User({ name, emailId, dob, otp, isVerified: false });
    await newUser.save();

    // Send OTP to email
    await sendOTP(emailId, otp);

    res.status(201).json({
      message: "User registered successfully. Please verify OTP sent to your email.",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { emailId, otp } = req.body;

    // Basic validation
    if (!emailId || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    // OTP comparison
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP expiration check (10 minutes)
    const lastUpdatedTime = user.updatedAt;
    if (Date.now() - new Date(lastUpdatedTime).getTime() > 10 * 60 * 1000) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Verify user and clear OTP
    user.isVerified = true;
    user.otp = "";
    await user.save();

    res.status(200).json({
      message: "User verified successfully",
      data: { name: user.name, emailId: user.emailId },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





export default authRouter;
