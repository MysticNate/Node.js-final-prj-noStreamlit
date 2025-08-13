import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";

// The file where I'm currently at (path shown dependent on OS)
export const __filename = fileURLToPath(import.meta.url); // Will give the path to global.js

// The directory where I'm currently at (path shown dependent on OS)
// Will give the path to the directory (file) where global.js is located. (The main project file)
export const __dirname = path.dirname(__filename);


// Secret key for JWT
export const SECRET = 'SECRET :)';

// Create storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.originalname.split(".").pop()}`
    );
  },
});

export const upload = multer({ storage });
