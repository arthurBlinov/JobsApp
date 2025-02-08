import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

export const encrypt = (text: string): { encryptedData: string; iv: string } => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString("hex") };
};
export const decrypt = (encryptedData: string, ivHex: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};