import { Router } from "express";
import { companySignUpCtrl, 
    loginCompanyCtrl,fetchCompanyDetailsCtrl, updateCompanyCtrl, 
    deleteCompanyCtrl, updateCompanyPasswordCtrl, updateCompanyIdCtrl,
    updateEmailCtrl, verifyAccount, 
    forgetPasswordToken} from "../controllers/Company";
import companyAuthMiddleware from "../middleware/companyAuthMiddleware";

const companyRoute = Router();

companyRoute.post('/signin', companySignUpCtrl);
companyRoute.post('/login', loginCompanyCtrl);
companyRoute.get('/retreive/:ID', companyAuthMiddleware, fetchCompanyDetailsCtrl);
companyRoute.put('/update/number/:ID', companyAuthMiddleware, updateCompanyIdCtrl);
companyRoute.put('/update/email/:ID', companyAuthMiddleware, updateEmailCtrl);
companyRoute.put('/update/:ID', companyAuthMiddleware, updateCompanyCtrl);
companyRoute.put('/updatepass/:ID', companyAuthMiddleware, updateCompanyPasswordCtrl);
companyRoute.put('/delete/:ID', companyAuthMiddleware, deleteCompanyCtrl);
companyRoute.post('/forget-password-token', forgetPasswordToken);
companyRoute.put('/verify-account/:string/:encrypted/:hashedId', verifyAccount);
export default companyRoute;