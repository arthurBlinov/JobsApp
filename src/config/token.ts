import jwt from "jsonwebtoken";

const generateToken = (id: string): string => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined");
  }
  return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "10d" });
};

export default generateToken;
