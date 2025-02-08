import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { transformToCV } from "../config/ai/aiService";

export const generateCV = expressAsyncHandler(async(req: Request, res: Response): Promise<void> => {
    
  try {
    const { text, translationTo } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text input is required." });
        return ;
    }
    const cvOutput = await transformToCV(text, translationTo);
    res.json({ success: true, cv: cvOutput });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to generate CV." });
  }

})