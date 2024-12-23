import mongoose, { Document, Schema } from "mongoose";

interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
}
const noteSchema: Schema<INote> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

export const notes = mongoose.model("notes", noteSchema);