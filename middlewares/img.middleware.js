const multer = require("multer");

// Configurer le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Définir le dossier de destination des fichiers
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = getFileExtension(file.originalname);
    const fileName ="product-"+ file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, fileName); // Définir le nom du fichier
  },
});

// Définir les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed."));
  }
};

// Créer l'objet de middleware multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Fonction utilitaire pour obtenir l'extension d'un fichier
const getFileExtension = (filename) => {
    return '.' + filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };
  

module.exports = upload;
