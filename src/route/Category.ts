import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { createCategoryCtrl, deleteCategoryCtrl, fetchAllCategoriesCtrl, fetchSingleCategoryCtrl, updateCategoryCtrl } from "../controllers/Category";

const categoryRoute = Router();

categoryRoute.post('/create', authMiddleware, createCategoryCtrl);
categoryRoute.put('/update/:id', authMiddleware, updateCategoryCtrl);
categoryRoute.delete('/delete/:id', authMiddleware, deleteCategoryCtrl);
categoryRoute.get('/fetch', fetchAllCategoriesCtrl);
categoryRoute.get('/fetch/:id', fetchSingleCategoryCtrl);

export default categoryRoute;