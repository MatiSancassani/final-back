import passport from "passport";
import gitHubStrategy from 'passport-github2';
import dotenv from 'dotenv';
import { generateToken } from "../utils/jsonwebtoken.js";
import { getUserByEmailService, registerUserService } from "../services/users.services.js";
import { createCartService } from "../services/carts.services.js";

// import config from "../config.js";

dotenv.config();

passport.use('github', new gitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {

            const email = profile.emails[0].value;
            let user = await getUserByEmailService(email);

            if (!user) {
                const cart = await createCartService();


                const newUser = {
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email: profile.emails[0].value,
                    password: 'asd', // Sin contraseña porque el login es con GitHub
                    rol: 'user',
                    cart_id: cart._id, // Crea un carrito 
                };

                user = await registerUserService({ ...newUser });
            }
            const { _id, name, lastName, rol, cart_id } = user;
            const token = generateToken({ _id, name, lastName, email, rol, cart_id });

            return done(null, { token, user });

        } catch (error) {
            done(error, false)
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;