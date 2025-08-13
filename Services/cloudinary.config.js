import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dflhcjed4",
  api_key: process.env.CLOUDINARY_API_KEY || "459587382365649",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "drmNc91EJnr_w-Qh2EbBWVHQHNI",
});

export default cloudinary;
