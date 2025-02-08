import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Category, { CategoryInterface } from "../schemas/Category";
import { AuthenticatedUserRequest } from "./User";

export const createCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
    try {
      const user = req.user; 
      if (!user) {
        res.status(401);
        throw new Error("User not authenticated");
      }
      if(!user.isAdmin){
        res.send('Error');
        return;
      }
      const category: CategoryInterface = await Category.create({
        userId: user?.id, 
        title: req.body.title,
      });
  
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

export const fetchAllCategoriesCtrl = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const categories: CategoryInterface[] = await Category.find({})
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const fetchSingleCategoryCtrl = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category: CategoryInterface | null = await Category.findById(id)
                                                                .populate('subCategories');
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const updateCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
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
    const category: CategoryInterface | null = await Category.findByIdAndUpdate(
      id,
      { title: req.body.title },
      { new: true, runValidators: true }
    );
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const deleteCategoryCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response): Promise<void> => {
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
    const deletedCategory: CategoryInterface | null = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.status(200).json(deletedCategory);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});
