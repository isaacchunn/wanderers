import multer from "multer";

// Multer configuration (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit each file to 5 MB
  },
});

export const upload_file_single = upload.single("file");
