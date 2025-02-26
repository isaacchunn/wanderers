import multer from "multer";

// Multer configuration (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const upload_file_single = upload.single("file");
