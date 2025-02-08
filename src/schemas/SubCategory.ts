import mongoose, { Schema, Document } from "mongoose";

export interface SubCategoryInterface extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  categoryId: mongoose.Schema.Types.ObjectId; 
  title: string; 
  keywords: [string];
}

const subCategorySchema: Schema<SubCategoryInterface> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    title: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      required: true
    }
  },
  {
  }
);

const SubCategory = mongoose.model<SubCategoryInterface>("SubCategory", subCategorySchema);
export default SubCategory;