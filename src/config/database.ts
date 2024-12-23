import mongoose from "mongoose";
const url: string ="mongodb+srv://nitesh123:nitesh123@cluster0.rrxfl.mongodb.net/noteTaking";
export default async function databaseConfig(next: () => void) {
  const db = await mongoose.connect(url);
  console.log("database connected successfully");
  next();
}
