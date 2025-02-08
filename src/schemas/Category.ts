import mongoose, { Schema, Document } from "mongoose";

export interface CategoryInterface extends Document {
  userId: mongoose.Schema.Types.ObjectId; 
  title: string; 
}

const categorySchema: Schema<CategoryInterface> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
  }
);
categorySchema.virtual('subCategories',{
    ref: 'SubCategory',
    foreignField: 'category',
    localField: 'id',    
})
const Category = mongoose.model<CategoryInterface>("Category", categorySchema);
export default Category;
