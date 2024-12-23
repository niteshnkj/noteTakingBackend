import { Request, Response, Router } from "express";
import verifyToken from "../middleware/verifyToken";
import User from "../models/user";
const profileRoute: any = Router();



profileRoute.get("/view", verifyToken, async (req: Request, res: Response) => {
  try {
    
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const userId: any  = loggedInUser.id; 
    const userData = await User.findById(userId); 

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const { otp: _, ...userWithoutOtp } = userData.toObject();
    res.status(200).json({
      message: "User fetched successfully",
      data: userWithoutOtp,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      message: "An error occurred while fetching the user",
    
    });
  }
});

export default profileRoute;


