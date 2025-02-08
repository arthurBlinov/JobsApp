import { Router } from "express";
import companyAuthMiddleware from "../middleware/companyAuthMiddleware";
import { createJobCtrl, updateJobCtrl, 
        deleteJobCtrl, fetchJobsBySubCategoryCtrl, 
        fetchSingleJobCtrl, disActiveJobCtrl, activeJobCtrl} from "../controllers/Job";

const jobsRoute = Router();

jobsRoute.post('/create', companyAuthMiddleware,createJobCtrl);
jobsRoute.put('/update/:ID', companyAuthMiddleware, updateJobCtrl);
jobsRoute.delete('/delete/:id', companyAuthMiddleware, deleteJobCtrl);
jobsRoute.get('/fetching/all/:id', fetchJobsBySubCategoryCtrl);
jobsRoute.get('/fetch/:ID', companyAuthMiddleware, fetchSingleJobCtrl);
jobsRoute.put('/disactivate/:id', companyAuthMiddleware, disActiveJobCtrl);
jobsRoute.put('/activate/:id', companyAuthMiddleware, activeJobCtrl);

export default jobsRoute;



