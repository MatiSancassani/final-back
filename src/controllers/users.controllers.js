
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import config from "../config.js";
import usersModel from '../dao/mongo/models/users.model.js';
import { getUserByEmailService, getUserByIdService } from "../services/users.services.js";
import { tokenEmail } from '../utils/jsonwebtoken.js';
import { createHash } from '../utils/bcryptPassword.js'

export const roleChange = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    try {

        const user = await usersModel.findByIdAndUpdate(id, { rol }, { new: true }).lean();
        if (!user) {
            return res.status(404).send({ message: "Usuario no encontrado" });
        }
        return res.status(200).send({ message: "Rol actualizado", user });

    } catch (err) {
        return res.status(500).send({ message: "Error al actualizar el rol", err });
    }
};


class PasswordService {
    constructor() { }

    lostPassword = async (email) => {
        try {
            const user = await getUserByEmailService(email);

            if (!user) {
                throw new Error('User not found');
            }

            const { _id } = user;
            const token = tokenEmail({ _id });
            this.sendResetEmail(user.email, `https://final-front-mva2.onrender.com/pages/resetPassword.html?token=${token}`);


            return 'Password reset email sent';
        } catch (err) {
            return err.message;
        }
    }

    resetPassword = async (token, newPassword) => {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
            const user = await getUserByIdService(decoded._id);

            if (!user) {
                throw new Error('User not found');
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                // throw new Error('The new password cannot be the same as the previous one');
                return { message: 'The new password cannot be the same as the previous one' };;
            }

            user.password = createHash(newPassword);

            await user.save();

            return { message: 'Password reset successfully', success: true };;
        } catch (err) {
            return err.message;
        }
    }

    sendResetEmail = (to, link) => {
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
            subject: 'Password reset',
            html: `
                <h1>Password reset</h1>
                <h2>A password change was requested, if it was you, click on the following link, otherwise ignore this email</h2>
                <a href="${link}">Continue with password change</a>
                `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    };


}
export default PasswordService;