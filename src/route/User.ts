import { Router } from "express";
import { userSignUpCtrl, 
    loginUserCtrl,fetchUsersCtrl, 
    fetchUserDetailsCtrl, updateUserCtrl, deleteUsersCtrl,
    updateUserPasswordCtrl, verifyAccount, 
    forgetPasswordToken, 
    addFileToCVs} from "../controllers/User";
import authMiddleware from "../middleware/authMiddleware";
import upload from "../middleware/fileUpload";

const userRoute = Router();

userRoute.post('/signin', userSignUpCtrl);
userRoute.post('/login', loginUserCtrl);
userRoute.get('/retrieve', authMiddleware, fetchUsersCtrl);
userRoute.get('/retrieve/:id', authMiddleware, fetchUserDetailsCtrl);
userRoute.put('/update/:id', authMiddleware, updateUserCtrl);
userRoute.put('/updatepass/:id', authMiddleware, updateUserPasswordCtrl);
userRoute.put('/delete/:id', authMiddleware, deleteUsersCtrl);
userRoute.post('/forget-password-token', forgetPasswordToken);
userRoute.put('/verify-account/:string/:encrypted/:hashedId', verifyAccount);
userRoute.post('/addcv/:id', authMiddleware, upload.single('file'), addFileToCVs);
export default userRoute;
