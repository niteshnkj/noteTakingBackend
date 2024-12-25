import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";

interface AuthRequest extends Request {
  user?: any; 
}

export const userAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get the cookies and extract the token
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please Login!!");
    }

    // Verify the token and extract the payload
    const secretKey = jwt.verify(token, "NOTEMAKING$435") as JwtPayload;
    if (!secretKey) {
      throw new Error("Invalid Secret Key");
    }

    // Extract user ID from the token payload
    const { _id } = secretKey as { _id: string };
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (err: any) {
    res.status(400).send("ERROR: " + err.message);
  }
};
