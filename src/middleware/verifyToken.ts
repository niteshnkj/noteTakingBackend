import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  data: {
    id: string;
    email: string;
  };
}

// function to verify the token
function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies.jwt;

    const decode = jwt.verify(
      token,
      process.env.JWTSECRET as string
    ) as JwtPayload;

    const { id, email } = decode.data;

    req.user = { id, email };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized Access - Invalid or Expired Token",
    });
  }
}

export default verifyToken;
