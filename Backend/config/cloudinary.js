import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

console.log(" Cloudinary env check:");
console.log("   CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "set" : "MISSING");
console.log("   API_KEY:", process.env.CLOUDINARY_API_KEY ? "set" : "MISSING");
console.log("   API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "set" : "MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "saferoute/reports",
      resource_type: "image",
      public_id: `report_${Date.now()}`,
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default cloudinary;