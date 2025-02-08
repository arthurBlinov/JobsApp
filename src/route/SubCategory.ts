import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { createSubCategoryCtrl, updateSubCategoryCtrl, 
        deleteSubCategoryCtrl, fetchAllSubCategoriesCtrl, fetchSingleSubCategoryCtrl} from "../controllers/SubCategory";

const subCategoryRoute = Router();

subCategoryRoute.post('/create', authMiddleware, createSubCategoryCtrl);
subCategoryRoute.put('/update/:id', authMiddleware, updateSubCategoryCtrl);
subCategoryRoute.delete('/delete/:id', authMiddleware, deleteSubCategoryCtrl);
subCategoryRoute.get('/fetch', fetchAllSubCategoriesCtrl);
subCategoryRoute.get('/fetch/:id', fetchSingleSubCategoryCtrl);

export default subCategoryRoute;