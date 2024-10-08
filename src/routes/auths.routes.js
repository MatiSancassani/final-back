import { Router } from "express";
// import jwt from 'jsonwebtoken'
import passport from "../config/passport.strategies.js";
import { createUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import PasswordService from '../controllers/users.controllers.js'

const router = Router();
const passwordService = new PasswordService();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);

router.get("/github", passport.authenticate("github", { session: false }));
router.get("/github/callback", passport.authenticate("github", { session: false }), (req, res) => {
    try {
        const user = req.user;
        const { token, user: { cart_id } } = user;

        // Set the token as an HTTP-only cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'None' });


        res.redirect(`https://final-front-mva2.onrender.com/pages/products.html?cart_id=${cart_id}`);
    } catch (error) {
        console.error("Error en /github/callback:", error);
        res.status(500).send("Error en el servidor");
    }
});


router.post("/lostPassword", async (req, res) => {
    const { email } = req.body;
    const result = await passwordService.lostPassword(email);

    if (result.includes("error")) {
        res.status(400).send(result);
    } else {
        res.send(result);
    }
});

router.post("/resetPassword", async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await passwordService.resetPassword(token, newPassword);
    if (result.success) {
        res.send({ message: result.message, redirectUrl: "https://final-front-mva2.onrender.com" });

    } else {
        res.status(400).send(result.message);
    }
});


export default router;