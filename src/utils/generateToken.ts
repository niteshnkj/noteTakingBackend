import jwt from "jsonwebtoken";
import { Response } from "express";

interface JwtPayload {
  id: string;
  email: string;
}

function generateToken(
  userId: string,
  name: string,
  email: string,
  res: Response
): void {
  const data: JwtPayload = { id: userId, email };

  // Generate the JWT token
  const token = jwt.sign({ data }, process.env.JWTSECRET as string, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });
}

export default generateToken;
