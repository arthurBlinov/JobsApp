import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Job, { JobInterface } from "../schemas/Job";
import { AuthenticatedRequest } from "./Company";
import validateMongodbId from "../utils/validateMongoId";

export const createJobCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.company?.id;
      if(!id){
        res.send('Check your account');
        return ;
      }
      const { companyId, 
        subCategoryId, title,
        amountOfExperience, description,
        employmentType, requirements,
        keyWords, 
         } = req.body;
      
      if(!companyId || !title || !subCategoryId ||
        !amountOfExperience || !description ||
        !employmentType || !requirements ||
        !keyWords){
        res.send('Error');
        return ;
       }
      
      const job: JobInterface = await Job.create({
        subCategory: subCategoryId,
        company: companyId, 
        title,
        description,
        amountOfExperience,
        employmentType,
        requirements, keyWords, 
        active: true,  
      });
  
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

export const fetchJobsBySubCategoryCtrl = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; 
      const { page = 1, limit = 20 } = req.query; 
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
            
      if (!id) {
        res.status(400).json({ message: "Subcategory ID is required" });
        return;
      }
  
      const jobs: JobInterface[] = await Job.find({ subCategory: id }) 
        .skip((pageNumber - 1) * limitNumber) 
        .limit(limitNumber).populate('company', 'name link'); 

      const totalJobs = await Job.countDocuments({ subCategory: id });
      res.status(200).json({
        jobs,
        pagination: {
          totalJobs,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalJobs / limitNumber),
          pageSize: limitNumber,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

export const fetchSingleJobCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { ID } = req.params;
    const {companyID} = req.body;
    if (req.company && "id" in req.company) {
      const { id } = req.company;
      if(id === companyID){
        validateMongodbId(companyID);
        const job: JobInterface | null = await Job.findById(ID).populate('company', 'name link');
        if (!job) {
          res.status(404).json({ message: "Job not found" });
          return;
        }
        res.status(200).json(job);
        return;
      }
    }
    
    res.send('Error')
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const updateJobCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { ID } = req.params;
    const company = req.company;
    const {id,title, companyId, subCategoryId, amountOfExperience, description,
      employmentType, requirements,
      keyWords} = req.body; 
      
      if (!company && !id) {
        res.send('Error');
        return;
      }
      
      if(!id || !companyId || !title || !subCategoryId ||
        !amountOfExperience || !description ||
        !employmentType || !requirements ||
        !keyWords){
        res.send('Error');
        return ;
       }
     if(id === company?.id){
      const job: JobInterface | null = await Job.findByIdAndUpdate(
        ID,
        { title, amountOfExperience, description,
          employmentType, requirements,
          keyWords },
        { new: true, runValidators: true }
      );
      if (!job) {
        res.status(404).json({ message: "Job not found" });
        return;
      }
      res.status(200).json(job);
     }
    
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});

export const deleteJobCtrl = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const company = req.company;
    const {companyID} = req.body;
      if (!company) {
        res.status(401);
        throw new Error("User not authenticated");
      }
      
      if(!id){
        res.send('Error');
        return;
      }
      if(companyID === company?.id){
        await Job.findByIdAndDelete(id);
        res.status(200).send('Deleted');
      }
    
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
  }
});
export const disActiveJobCtrl = expressAsyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const company = req.company;
    const {companyID} = req.body;
    if (!company) {
      res.status(401);
      throw new Error("User not authenticated");
    }
    
    if(!id){
      res.send('Error');
      return;
    }
    if(companyID === company?.id){
      await Job.findByIdAndUpdate(id, {
          active: false
      })
      res.status(200).send('Deleted');
    }
})
export const activeJobCtrl = expressAsyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const company = req.company;
    const {companyID} = req.body;
    if (!company) {
      res.status(401);
      throw new Error("User not authenticated");
    }
    
    if(!id){
      res.send('Error');
      return;
    }
    if(companyID === company?.id){
      await Job.findByIdAndUpdate(id, {
          active: true
      })
      res.status(200).send('Deleted');
    }
})