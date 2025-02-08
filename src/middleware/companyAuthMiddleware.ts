import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Company, { CompanyInterface } from "../schemas/Company";

interface AuthenticatedRequest extends Request {
  company?: CompanyInterface;
}

const companyAuthMiddleware = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    if (req?.headers?.authorization?.startsWith("Bearer")) {
      try {
        token = req.headers.authorization.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_KEY || "") as { id: string };
          const company = await Company.findById(decoded.id).select("-password");

          if (!company) {
            throw new Error("Company not found");
          }
          req.company = company; 
          next();
        } else {
          throw new Error("There is no token attached to the header");
        }
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token expired, log in again");
      }
    } else {
      res.status(401);
      throw new Error("There is no token attached to the header");
    }
  }
);

export default companyAuthMiddleware;