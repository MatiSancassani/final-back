import { Router } from "express";
import { getUserByIdService } from "../services/users.services.js";
import { uploader } from "../utils/uploader.js";
import { validateJWT } from "../middleware/auth.js";
import config from "../config.js";

const router = Router();

// router.post("/profiles", uploader.single('profilesImages', 3), async (req, res) => {
//     res.status(200).json({ status: 'OK', payload: 'Imagenes Subidas', files: req.files })
// });

router.post("/documents", validateJWT, uploader('documents').array('documentsImages', 3), async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await getUserByIdService(_id);

        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const documentName = file.originalname;
                const documentReference = `${config.SERVER_UPLOAD_PATH}/documents/${file.filename}`; // Cambia UPLOAD_DIR a SERVER_UPLOAD_PATH
                user.documents.push({ name: documentName, reference: documentReference });
            });
        } else {
            return res.status(400).json({ msg: "No se subieron archivos" });
        }

        const requiredDocuments = 3;
        if (user.documents.length < requiredDocuments) {
            return res.status(400).json({ msg: "Documentación incompleta, por favor suba todos los documentos requeridos." });
        }

        if (user.documents.length >= 3 && user.rol !== 'premium') {
            user.rol = 'premium';
        }

        await user.save();

        console.log("Documentos guardados correctamente");
        return res.status(200).json({ msg: "Documento subido exitosamente", documents: user.documents });

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
    }
});

export default router