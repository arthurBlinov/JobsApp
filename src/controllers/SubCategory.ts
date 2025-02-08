import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import SubCategory, { SubCategoryInterface } from "../schemas/SubCategory";
import { AuthenticatedUserRequest } from "./User";

export const createSubCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const { id, title } = req.body;
      if (!user) {
        res.status(401);
        throw new Error("User not authenticated");
      }
      if(!user.isAdmin){
        res.send('Error');
        return;
      }
      if(!id || !title){
        res.send('Error');
        return ;
      }
      const subCategory: SubCategoryInterface = await SubCategory.create({
        userId: user?.id,
        categoryId: id, 
        title: req.body.title,
      });
  
      res.status(201).json(subCategory);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

export const fetchAllSubCategoriesCtrl = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories: SubCategoryInterface[] = await SubCategory.find({})
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const fetchSingleSubCategoryCtrl = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subCategory: SubCategoryInterface | null = await SubCategory.findById(id);
    if (!subCategory) {
      res.status(404).json({ message: "SubCategory not found" });
      return;
    }
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const updateSubCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {title} = req.body; 
      if (!user) {
        res.status(401);
        throw new Error("User not authenticated");
      }
      if(!user.isAdmin){
        res.send('Error');
        return;
     }
     if(!title || !id){
        res.send('Error');
        return;
     }
    const subCategory: SubCategoryInterface | null = await SubCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true }
    );
    if (!subCategory) {
      res.status(404).json({ message: "SubCategory not found" });
      return;
    }
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const deleteSubCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user; 
      if (!user) {
        res.status(401);
        throw new Error("User not authenticated");
      }
      if(!user.isAdmin){
        res.send('Error');
        return;
      }
      if(!id){
        res.send('Error');
        return;
      }
    const deletedSubCategory: SubCategoryInterface | null = await SubCategory.findByIdAndDelete(id);
    if (!deletedSubCategory) {
      res.status(404).json({ message: "SubCategory not found" });
      return;
    }
    res.status(200).json(deletedSubCategory);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});