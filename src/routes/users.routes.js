import { Router } from "express";
import nodemailer from "nodemailer";
import moment from "moment";
import cron from 'node-cron';

import config from "../config.js";
import { validateJWT } from "../middleware/auth.js";
import { handlePolicies } from "../utils/verifys.js";
import { roleChange } from "../controllers/users.controllers.js";
import { deleteUserService, getAllUsers } from "../services/users.services.js";
import { verifyAuthoentication } from "../middleware/auth.js";


const router = Router();


router.get("/", validateJWT, handlePolicies(["admin"]), async (req, res) => {
    try {
        const allUsers = await getAllUsers();
        const usersData = allUsers.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            rol: user.rol
        }));
        res.status(200).send(usersData);
    } catch (error) {
        res.status(500).send({ message: "Error al obtener los usuarios", error });
    }
});

router.delete("/:id", validateJWT, handlePolicies(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUserService(id);
        if (!deletedUser) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }
        res.status(200).send({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar el usuario", error });
    }
});


router.put("/:id/role", validateJWT, handlePolicies(["admin"]), roleChange);

router.get("/profile", validateJWT, verifyAuthoentication, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);

    } catch (error) {
        res.status(500).send({ message: "Error al obtener el usuario", error });
    }
});


cron.schedule('*/10 * * * *', async () => {
    console.log('Verificando usuarios inactivos para eliminar...');
    try {
        const now = moment();
        const users = await getAllUsers();
        const inactiveUsers = users.filter(user => {
            const lastConnection = moment(user.last_connection);
            const inactiveForMoreThan30Minutes = now.diff(lastConnection, 'minutes') > 10;
            const isUserOrPremium = user.rol === 'user' || user.rol === 'premium';
            return inactiveForMoreThan30Minutes && isUserOrPremium;
        });

        if (inactiveUsers.length === 0) {
            console.log("No hay usuarios inactivos para eliminar.");
            return;
        }


        for (const user of inactiveUsers) {
            await deleteUserService(user._id);
            await sendInactivityEmail(user.email);
        }

        console.log(`${inactiveUsers.length} usuarios eliminados por inactividad.`);
    } catch (error) {
        console.error("Error al eliminar usuarios inactivos:", error);
    }
});


const sendInactivityEmail = async (to) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.GMAIL_APP_USER,
            pass: config.GMAIL_APP_PASS,
        },
    });

    const mailOptions = {
        from: config.GMAIL_APP_USER,
        to,
        subject: 'Cuenta eliminada por inactividad',
        html: `
            <h1>Cuenta eliminada por inactividad</h1>
            <p>Tu cuenta ha sido eliminada debido a que no te has conectado en los últimos 30 minutos.</p>
        `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error al enviar el correo:', err);
        } else {
            console.log('Correo enviado:', info.response);
        }
    });
};




export default router