// import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import config, { errorsDictionary } from "../config.js";
import CustomError from "../services/errors/CustomError.class.js";

export const verifyAuthoentication = (req, res, next) => {
    if (!req.user) throw new CustomError(errorsDictionary.USER_NOT_FOUND);
    return next();
};


export const validateJWT = (req, res, next) => {
    // const token = req.header('Authorization')?.replace('Bearer ', '');
    const token = req.cookies.token;
    // console.log('Token recibido:', token); // Depuración
    if (!token) {
        return res.status(401).send({ msg: 'No hay token en la peticion' })
    }

    try {
        const { _id, email, rol, name, lastName, cart_id } = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = { _id, name, lastName, email, rol, cart_id };
        // console.log('Usuario verificado:', req.user); // Depuración
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).send({ msg: 'Token no valido' })
    }
}