import mongoose, { Schema, Document } from "mongoose";

export interface JobInterface extends Document {
  title: string;
  company: mongoose.Schema.Types.ObjectId;
  amountOfExperience: Number;
  employmentType: 'משרה מלאה' | 'משרה חלקית' | 'התנדבות' | 'התמחות/סטאז' | 'סטודנט' | 'היברידי' | 'עבודה מרחוק';
  description: string;
  requirements: string;
  subCategory: mongoose.Schema.Types.ObjectId;
  keyWords: [string];
  active: Boolean;
}

const jobSchema: Schema<JobInterface> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company", 
        required: true,
    },
    amountOfExperience: {
        type: String,
        required: true
    },
    employmentType: {
        type: String,
        enum: ['משרה מלאה', 'משרה חלקית', 'התנדבות', 'התמחות/סטאז', 'סטודנט', 'היברידי', 'עבודה מרחוק'],
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',
        required: true
    },
    keyWords: {
        type: [String],
        required: true,
    },
    active: {
        type:Boolean,
        required: true
    }
  },
  {
  }
);
jobSchema.virtual('subCategories',{
    ref: 'SubCategory',
    foreignField: 'Job',
    localField: 'id',    
})
jobSchema.virtual('Company',{
    ref: 'Company',
    foreignField: 'Job',
    localField: 'id',    
})
const Job = mongoose.model<JobInterface>("Job", jobSchema);
export default Job;