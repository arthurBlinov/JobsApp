import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import sgMail from "../config/sgMail";
import crypto from "crypto";
import User, { UserInterface } from "../schemas/User";
import generateToken from "../config/token";
import validateMongodbId from "../utils/validateMongoId";
import sharp from "sharp";
import { encrypt, decrypt } from "../utils/Encryption";

export interface AuthenticatedUserRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export const userSignUpCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
    
  try {
    const { firstName, lastName, email, password } = req.body;
    if(!firstName || !lastName || !email || !password){
        throw new Error("all parametres are required");
    }   
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists")
    };
    const user: UserInterface = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    const encryptedEmail = encrypt(user.email); 
    const hashedId = crypto.createHash("sha256").update(user.id.toString()).digest("hex");
    const verificationURL = `
      <p>If you requested to verify your account, verify now by clicking the link below:</p>
      <a href="http://localhost:5000/user/verify-account/${encryptedEmail.encryptedData}/${encryptedEmail.iv}/${hashedId}">Click here to verify your account</a>
    `;
    const msg = {
      to: user.email,
      from: "blinov.arthur.2023@gmail.com",
      subject: "Verify Account",
      html: verificationURL,
    };

    await sgMail.send(msg);

    res.status(201).json({
      message: "User registered successfully. Verification email sent.",
      user,
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error during registration", error });
  }
});

export const verifyAccount = expressAsyncHandler(async (req: Request, res: Response) => {
    
    try {
        const { string, encrypted, hashedId } = req.params;
        const decryptedEmail: string = decrypt(string, encrypted);
        const userFound: UserInterface | null = await User.findOne({email: decryptedEmail});
        if (!userFound) {
            throw new Error("Invalid or expired verification link");
        }
        const ifHashedId: boolean = crypto.createHash("sha256").update(userFound.id.toString()).digest("hex") === hashedId
        if(ifHashedId){
           await User.findByIdAndUpdate(userFound.id, {
                isAccountVerified: true
            })
            res.json({
                message: "Account successfully verified",
            });
        }else{
            res.status(500).json({ message: "Verification failed"});
        }
        } catch (error) {
            res.status(500).json({ message: "Verification failed"});
        }
  });
  
export const loginUserCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
  
    try {
        const { email, password } = req.body; 
        if(!email || !password){
            throw new Error("all parametres are required")
        }
        const userFound: UserInterface | null = await User.findOne({ email });
        if (userFound && (await userFound.isPasswordMatched(password)) && userFound.isAccountVerified) {
            res.json({
            id: userFound.id,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            email: userFound.email,
            isAdmin: userFound.isAdmin,
            token: generateToken(userFound.id),
            isAccountVerified: userFound.isAccountVerified,
            })

    }else{
        throw new Error("Invalid login credentials")
    }   
    } catch (error) {
        res.status(401);
        throw new Error("Invalid login credentials");
    }
  
  
});

// Fetch All Users
export const fetchUsersCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
  
  try {
    const { id } = req.body;
    if(!id){
        throw new Error("all parametres are required")
    }
    const user: UserInterface | null = await User.findById(id);
    if(user && user.isAccountVerified){
        validateMongodbId(id);
        const usersList = await User.find({});
        res.json(usersList);
    }
  } catch (error) {
    res.json(error);
  }
});

export const deleteUsersCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response) => {
    try {
        const id = req.user?.id;
        const {ID} = req.params;
        if(ID !== id){
          res.send('check your account');
          return ;
        }
        if(!id || !ID){
            res.send("all parametres are required");
            return ;
        }
        const user: UserInterface | null = await User.findById(id);
        if(user && user.isAccountVerified){
          validateMongodbId(id);
          await User.findByIdAndUpdate(id, {
              ifDeleted: true
          })
        }
        res.send('Deleted Succesfully');
    } catch (error) {
        res.json(error);
    }
});

// Fetch User Details
export const fetchUserDetailsCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id){
        throw new Error('all parametres are required');
    }
    validateMongodbId(id);
    const user: UserInterface | null = await User.findById(id);
    if(user && user?.isAccountVerified){
        res.json(user);
    }
  } catch (error) {
    res.json(error);
  }
});

// Update User Profile
export const updateUserCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response) => {
  
  try {
    const { id } = req.user!;
    const {ID} = req.params;
    if(ID !== id){
      res.send('check your account');
      return ;
    }
    if(!id || !ID){
        throw new Error('all parametres are required');
    }
    validateMongodbId(id);
    const user: UserInterface | null = await User.findByIdAndUpdate(
      id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      },
      { new: true, runValidators: true }
    );
    if(user && user?.isAccountVerified){
        res.json(user);
     }
  } catch (error) {
    res.json(error);
  }
});
export const updateEmailCtrl = expressAsyncHandler(async(req: AuthenticatedUserRequest, res: Response) => {
  try {
      const id = req.user?.id;
      const {ID} = req.params;
      const { newEmail } = req.body;
      if(ID !== id){
          res.send('check your account');
          return ;
      }
      if(!id){
          res.send('all parametres are required');
          return ;
      }
      validateMongodbId(id);
      const userExists = await User.findOne({ newEmail });
      if (userExists) {
          res.send('Email is in use');
          return ;
      };
      const company: UserInterface | null = await User.findByIdAndUpdate(id, {
          email: newEmail,
          isAccountVerified: false
      });
      if(!company){
          res.send('Error')
          return ;
      }
      const encryptedEmail = encrypt(newEmail); 
      const hashedId = crypto.createHash("sha256").update(id.toString()).digest("hex");
      const verificationURL = `
          <p>Your email was succesfully changed. Click button to verify it</p>
          <a href="http://localhost:5000/user/verify-account/${encryptedEmail.encryptedData}/${encryptedEmail.iv}/${hashedId}">Click here to verify your account</a>
      `;
          const msg = {
          to: newEmail,
          from: "blinov.arthur.2023@gmail.com",
          subject: "Email changing verification",
          html: verificationURL,
          };

      await sgMail.send(msg);
      res.send('Your email was changed, check this email');
  } catch (error) {
      res.send('Error')
  }
})
// Update User Password
export const updateUserPasswordCtrl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response) => {

    try {
    const { id } = req.user!;
    const {ID} = req.params;
    if(ID !== id){
      res.send('check your account');
      return ;
    }
    if(!id){
      res.send('all parametres are required');
      return ;
    }
    const { oldPassword, newPassword } = req.body;
    if(!id || !oldPassword || !newPassword){
        throw new Error('all parametres are required')
    }
    validateMongodbId(id);
    const user: UserInterface | null = await User.findById(id);
    if (user && (await user.isPasswordMatched(oldPassword)) && user.isAccountVerified) {
      user.password = newPassword;
      user.save();
      res.send('password updated succesfully');
    } else {
      res.status(400).json({ message: "Password is required" });
    }
  } catch (error) {
    res.json(error);
  }
});

// Send Account Verification Email
// export const generateVerificationTokenControl = expressAsyncHandler(async (req: AuthenticatedUserRequest, res: Response) => {

//   try {
//     const loginUser = req.user!.id;
//     const user: UserInterface | null = await User.findById(loginUser);
//     const verificationToken = await user!.createAccountVerificationToken();
//     await user!.save();

//     const resetURL = `
//       If you requested to verify your account, verify now within 10 minutes:
//       <a href="http://localhost:5000/user/verify-account/${verificationToken}">Click here</a>
//     `;

//     const msg = {
//       to: user!.email,
//       from: "blinov.arthur.2023@gmail.com",
//       subject: "Verify Account",
//       html: resetURL,
//     };

//     await sgMail.send(msg);
//     res.json({ message: "Verification email sent", resetURL });
//   } catch (error) {
//     res.json(error);
//   }
// });

// Password Reset
export const forgetPasswordToken = expressAsyncHandler(async (req: Request, res: Response) => {
  
  try {
    const { email } = req.body;
    if(!email){
        throw new Error('all parametres are required')
    }
    const user: UserInterface | null = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const token = await user.createPasswordResetToken();
    await user.save();

    const resetURL = `
      If you requested to reset your password, reset now within 10 minutes:
      <a href="http://localhost:5000/user/reset-password/${token}">Click here</a>
    `;

    const msg = {
      to: email,
      from: "blinov.arthur.2023@gmail.com",
      subject: "Reset Password",
      html: resetURL,
    };

    await sgMail.send(msg);
    res.json({
      message: `A reset password email has been sent to ${user.email}.`,
      resetURL,
    });
  } catch (error) {
    res.json(error);
  }
});

export const addFileToCVs = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const {id} = req.params;
        if(!id){
            throw new Error('all parametres are required');
        }
        if (!req.file) {
          res.status(400).json({ message: "No file uploaded" });
          return;
        }
  
        const user = await User.findById(id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        if(!user.isAccountVerified){
            res.send('Verify your account')
            return;
        }
        if (user.cvs.length > 9) {
          res.status(400).json({ message: "Maximum number of CVs (10) reached" });
          return;
        }
  
        let fileBuffer = req.file.buffer;
        if (req.file.size > 1024 * 1024) {
          fileBuffer = await sharp(fileBuffer)
            .resize({ width: 1000 }) 
            .toBuffer();
        }
        user.cvs.push(fileBuffer);
        await user.save();
        res.status(200).json({ message: "File uploaded successfully", cvs: user.cvs });
      } catch (error) {
        next(error); 
      }
    }
  )