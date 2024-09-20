import path from 'path'
import multer from 'multer'
import fs from 'fs';
import config from '../config.js'

// const storage = multer.diskStorage({
//     destination: (req, files, cb) => {
//         const subFolder = path.basename(req.path);
//         cb(null, `${config.UPLOAD_DIR}/${subFolder}/`);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`);
//     }
// });

// export const uploader = multer({ storage: storage });

const getDynamicStorage = (subFolder) => {
    const uploadPath = path.join(config.UPLOAD_DIR, subFolder);

    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}_${file.originalname}`);
        }
    });
};

// Función para crear un uploader dinámico basado en la subcarpeta
export const uploader = (subFolder) => {
    const storage = getDynamicStorage(subFolder);
    return multer({ storage }); // Asegurarse de retornar la instancia multer
};