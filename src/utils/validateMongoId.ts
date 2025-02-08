import mongoose from "mongoose";

const validateMongodbId = (id: string): void => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("The id is not valid or found");
  }
};

export default validateMongodbId;
