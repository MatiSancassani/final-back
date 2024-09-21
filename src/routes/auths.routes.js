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
    const user = req.user
    console.log(user)
    // Aquí es donde se maneja el JWT y se devuelve al cliente
    res.cookie("token", req.user.token, { httpOnly: true, secure: true, sameSite: 'None' });
<<<<<<< HEAD
    res.redirect(`https://final-front-mva2.onrender.com/pages/products.html`);
=======
    res.redirect(`http://127.0.0.1:5500/front/index.html`);
>>>>>>> 92463aafe36899ad3cceb9c76b9f413008241818
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
<<<<<<< HEAD
        res.send({ message: result.message, redirectUrl: "https://final-front-mva2.onrender.com/pages/login.html" });
=======
        res.send({ message: result.message, redirectUrl: "http://127.0.0.1:5500/front/pages/login.html" });
>>>>>>> 92463aafe36899ad3cceb9c76b9f413008241818
    } else {
        res.status(400).send(result.message);
    }
});


export default router;