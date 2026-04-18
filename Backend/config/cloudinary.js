import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// multer-storage-cloudinary@4 expects the v1-compatible cloudinary object.
// We import cloudinary v1-style via the `v2` alias — passing `cloudinary`
// directly (not cloudinary.v2) satisfies the peer dep.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "saferoute/reports",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1600, height: 1600, crop: "limit", quality: "auto" },
    ],
  },
});

// NOTE: multer v2 changed fileFilter's callback signature.
// Passing an Error as the first argument to cb() now throws instead of
// forwarding to the error-handling middleware, causing a 400 with an
// unhelpful "Upload failed" body. We use a custom wrapper middleware
// so multer errors are caught and forwarded properly.
const multerInstance = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB hard cap
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      // Pass false (reject) rather than an Error to avoid multer v2
      // throwing synchronously before our error handler runs.
      cb(null, false);
    }
  },
});

// Wrap upload.single so multer errors are forwarded as Express errors
// instead of crashing the request with a raw 400/500.
export const upload = {
  single: (fieldName) => (req, res, next) => {
    multerInstance.single(fieldName)(req, res, (err) => {
      if (err) {
        // Pass to the route's error-handling middleware
        return next(err);
      }
      next();
    });
  },
};

export default cloudinary;