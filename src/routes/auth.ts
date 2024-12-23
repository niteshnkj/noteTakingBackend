import User from "../models/user";
import { Router, Request, Response } from "express";
import { sendOTP } from "../utils/emailServices";
import generateToken from "../utils/generateToken";
const authRouter: any = Router();
import crypto from "crypto";
// Utility function to generate a secure OTP
const generateOTP = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); 
};

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, dob, emailId } = req.body;

    // Basic validation
    if ( !name||!dob||!emailId) {
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
    // Generate token and respond
    const { otp: _, ...userWithoutOtp } = newUser.toObject();
    res.status(201).json({
      message: "User registered successfully. Please verify OTP sent to your email.",
      data:userWithoutOtp
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
    const userId: any = user._id;
    generateToken(userId, user.name, user.emailId, res);
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
    user.otp = otp;
    user.isVerified = false;
    await user.save();
    await sendOTP(emailId, otp);
    const userId: any = user._id;
    generateToken(userId, user.name, user.emailId, res);

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

    // Validate input
    if (!emailId || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find the user by email
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired (for example, 10 minutes expiry)
    const otpExpiryTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    const currentTime = Date.now();
    const otpTimestamp = new Date(user.updatedAt).getTime(); // Using the updatedAt timestamp

    if (currentTime - otpTimestamp > otpExpiryTime) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = ""; // Clear the OTP after successful verification
    await user.save();

    // Generate token and respond
    const userId: any = user._id;
    generateToken(userId, user.name, user.emailId, res);

    const { otp: _, ...userWithoutOtp } = user.toObject();
    res.status(200).json({
      message: "Login successful",
      data: userWithoutOtp,
    });
  } catch (error) {
    
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/logout", (req: Request, res: Response) => {
  try {
    // Clear the JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




export default authRouter;

