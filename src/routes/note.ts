import { Request, Response, Router } from "express";
import { notes } from "../models/notes";
import { userAuth } from "../middleware/userAuth";

const noteRoute: any = Router();




noteRoute.post(
  "/createNote",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const userId: any = req.user?._id;

      // Check if userId is available
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Title validation
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      const newNote = new notes({
        title,
        userId,
      });

      const savedNote = await newNote.save();

      return res.status(201).json({
        message: "Note created successfully",
        note: savedNote,
      });
    } catch (error) {
      console.error("Error creating note:", error);
      return res.status(500).json({
        message: "Error creating note",
        
      });
    }
  }
);


noteRoute.delete(
  "/deleteNote/:id",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

     

      const note = await notes.findByIdAndDelete(id);

      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      return res.status(200).json({
        message: "Note deleted successfully",
        noteId: id, 
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      return res.status(500).json({
        message: "Error deleting note",
      });
    }
  }
);


noteRoute.get("/getNotes", userAuth, async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userId: any  = loggedInUser._id; 
    // Fetch the notes for the authenticated user
    const noteData = await notes.find({ userId });

    // If no notes are found, return a message saying so
    if (noteData.length === 0) {
      return res.status(404).json({ message: "No notes found" });
    }

    // Return the notes if found
    res.status(200).json({
        message:"Notes fetched sucessfully",
        note:noteData,
    });
    console.log(noteData)
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      message: "Something went wrong while fetching notes",
      
    });
  }
});

export default noteRoute;