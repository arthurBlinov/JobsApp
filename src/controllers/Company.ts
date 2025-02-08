import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import crypto from "crypto";
import Company, { CompanyInterface } from "../schemas/Company";
import generateToken from "../config/token";
import validateMongodbId from "../utils/validateMongoId";
import { encrypt, decrypt } from "../utils/Encryption";
import sgMail from "../config/sgMail";

export interface AuthenticatedRequest extends Request {
  company?: { id: string; email: string};
}


export const companySignUpCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
    
  try {
    const { name, companyId, telNumber, 
                email,  password, address, link } = req.body;
    if(!name || !companyId || !telNumber || !email || !password || !link){
        res.send('all parametres are required');
        return ;
    }   
    const companyExists = await Company.findOne({ email }) || await Company.findOne({companyId});
    if (companyExists) {
        res.send("Company already exists");
        return ;
    };
    const company: CompanyInterface = await Company.create({
      name, companyId, telNumber,
      email, password, address, link
    });
    const encryptedEmail = encrypt(company.email); 
    const hashedId = crypto.createHash("sha256").update(company.id.toString()).digest("hex");
    const verificationURL = `
      <p>If you requested to verify your account, verify now by clicking the link below:</p>
      <a href="http://localhost:5000/company/verify-account/${encryptedEmail.encryptedData}/${encryptedEmail.iv}/${hashedId}">Click here to verify your account</a>
    `;
    const msg = {
      to: company.email,
      from: "blinov.arthur.2023@gmail.com",
      subject: "Verify Account",
      html: verificationURL,
    };

    await sgMail.send(msg);

    res.status(201).json({
      message: "Company registered successfully. Verification email sent.",
      company,
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error during registration", error });
  }
});

export const verifyAccount = expressAsyncHandler(async (req: Request, res: Response) => {
    
    try {
        const { string, encrypted, hashedId } = req.params;
        const decryptedEmail: string = decrypt(string, encrypted);
        const companyFound: CompanyInterface | null = await Company.findOne({email: decryptedEmail});
        if (!companyFound) {
            res.send('Something went wrong');
            return ;
        }
        const ifHashedId: boolean = crypto.createHash("sha256").update(companyFound.id.toString()).digest("hex") === hashedId
        if(ifHashedId){
           await Company.findByIdAndUpdate(companyFound.id, {
                isAccountVerified: true
            })
            res.json({
                message: "Account successfully verified",
            });
        }else{
            res.status(500).json({ message: " here Verification failed"});
        }
        } catch (error) {
            res.status(500).json({ message: "Verification failed"});
        }
  });
  
export const loginCompanyCtrl = expressAsyncHandler(async (req: Request, res: Response) => {
  
    try {
        const { name, companyId, email, password } = req.body; 
        if(!email || !password || !name || !companyId){
            throw new Error("all parametres are required")
        }
        const companyFound: CompanyInterface | null = await Company.findOne({ email });
        if (companyFound && (await companyFound.isPasswordMatched(password)) && companyFound.isAccountVerified) {
            res.json({
            id: companyFound.id,
            companyId: companyFound.companyId,
            name: companyFound.name,
            email: companyFound.email,
            token: generateToken(companyFound.id),
            isAccountVerified: companyFound.isAccountVerified,
            })

    }else{
        throw new Error("Invalid login credentials")
    }   
    } catch (error) {
        res.status(401);
        throw new Error("Invalid login credentials");
    }
  
  
});

export const deleteCompanyCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { ID } = req.params;
        const id: string | undefined = req.company?.id;
        if(ID !== id){
            res.send('check your account');
            return ;
        }
        if(!ID){
            throw new Error("all parametres are required")
        }
        const company: CompanyInterface | null = await Company.findById(ID);
        if(company && company.isAccountVerified){
          validateMongodbId(ID);
          await Company.findByIdAndUpdate(ID, {
              ifDeleted: true
          })
        }
        res.send('Deleted Succesfully');
    } catch (error) {
        res.json(error);
    }
});

// Fetch Company Details
export const fetchCompanyDetailsCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ID } = req.params;
    if(!ID){
        throw new Error('all parametres are required');
    }
    validateMongodbId(ID);
    const company: CompanyInterface | null = await Company.findById(ID);
    if(company && company?.isAccountVerified){
        res.json(company);
    }
  } catch (error) {
    res.json(error);
  }
});

// Update Company Profile
export const updateCompanyCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  
  try {
    const { id } = req.company!;
    const { ID } = req.params;
    if(ID !== id){
        res.send('check your account');
        return ;
    }
    const {telNumber, 
        name, description, address } = req.body;
    if(!id){
        res.send('all parametres are required');
        return;
    }
    validateMongodbId(id);
    const company: CompanyInterface | null = await Company.findByIdAndUpdate(
      id,
      {
        name, telNumber, 
        description, address
      },
      { new: true, runValidators: true }
    );
    if(company && company?.isAccountVerified){
        res.json(company);
     }
  } catch (error) {
    res.json(error);
  }
});
export const updateEmailCtrl = expressAsyncHandler(async(req: AuthenticatedRequest, res: Response) => {
        try {
            const id = req.company?.id;
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
            const companyExists = await Company.findOne({ newEmail });
            if (companyExists) {
                res.send('Email is in use');
                return ;
            };
            const company: CompanyInterface | null = await Company.findByIdAndUpdate(id, {
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
                <a href="http://localhost:5000/company/verify-account/${encryptedEmail.encryptedData}/${encryptedEmail.iv}/${hashedId}">Click here to verify your account</a>
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
export const updateCompanyIdCtrl = expressAsyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    try {
        const company = req.company!;
        const {companyId} = req.body;
        const {ID} = req.params;
        if(ID !== company.id){  
            res.send('check your account');
            return ;
        }
        if(!company || !company.id){
            res.send('Error');
            return ;
        }
        if(!companyId){
            res.send('Error');
            return ;
        }
        validateMongodbId(company.id);
        const companyExists = await Company.findOne({ companyId });
        if (companyExists) {
            res.send('company id is in use');
            return ;
        };
        await Company.findByIdAndUpdate(company.id, {
            companyId
        });
        const url = `
                <p>Your id was succesfully changed</p>
        `;
        const msg = {
            to: company.email!,
            from: "blinov.arthur.2023@gmail.com",
            subject: "Your id was changed",
            html: url,
        };

        await sgMail.send(msg);
        res.send('Updated successfully');
    } catch (error) {
        res.json(error);
    }
})
// Update Company Password
export const updateCompanyPasswordCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {

    try {
    const { id } = req.company!;
    const { oldPassword, newPassword } = req.body;
    const {ID} = req.params;
    if(ID !== id){  
        res.send('check your account');
        return ;
    }
    if(!id || !oldPassword || !newPassword){
        throw new Error('all parametres are required')
    }
    validateMongodbId(id);
    const company: CompanyInterface | null = await Company.findById(id);
    if (company && (await company.isPasswordMatched(oldPassword)) && company.isAccountVerified) {
      company.password = newPassword;
      company.save();
      const url = `
                <p>Your id was succesfully changed</p>
        `;
        const msg = {
            to: company.email!,
            from: "blinov.arthur.2023@gmail.com",
            subject: "Your id was changed",
            html: url,
        };
    await sgMail.send(msg);
      res.send('password updated succesfully');
      
    
    } else {
      res.status(400).json({ message: "Password is required" });
    }
  } catch (error) {
    res.json(error);
  }
});

export const forgetPasswordToken = expressAsyncHandler(async (req: Request, res: Response) => {
  
  try {
    const { email } = req.body;
    if(!email){
        throw new Error('all parametres are required')
    }
    const company: CompanyInterface | null = await Company.findOne({ email });
    if (!company) throw new Error("Company not found");
    const token = await company.createPasswordResetToken();
    await company.save();

    const resetURL = `
      If you requested to reset your password, reset now within 10 minutes:
      <a href="http://localhost:5000/company/reset-password/${token}">Click here</a>
    `;

    const msg = {
      to: email,
      from: "blinov.arthur.2023@gmail.com",
      subject: "Reset Password",
      html: resetURL,
    };

    await sgMail.send(msg);
    res.json({
      message: `A reset password email has been sent to ${company.email}.`,
      resetURL,
    });
  } catch (error) {
    res.json(error);
  }
});
