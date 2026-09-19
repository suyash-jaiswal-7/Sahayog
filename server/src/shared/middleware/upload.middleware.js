import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("File name:", file.originalname);
  console.log("File type:", file.mimetype);

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png"
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf("."));

 
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  // JPG/PNG sometimes comes as application/octet-stream
  if (
    file.mimetype === "application/octet-stream" &&
    allowedExtensions.includes(fileExtension)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG images are allowed!"
    ),
    false
  );
};

export const multerStorage = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },

  fileFilter,
});