import { getUserByEmailService, registerUserService, getUserByIdService, getAllUsers } from "../services/users.services.js";
import { createHash, isValidPassword } from "../utils/bcryptPassword.js";
import { generateToken } from "../utils/jsonwebtoken.js";
import { createCartService } from "../services/carts.services.js";
import jwt from "jsonwebtoken";

import config from "../config.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmailService(email);
    if (!user) return res.status(400).json({
      success: false,
      message: "Email incorrecto",
    })

    const validPassword = isValidPassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Password incorrecta",
      });
    }

    const { _id, name, lastName, rol, cart_id } = user;
    const jwt = generateToken({ _id, name, lastName, email, rol, cart_id });

    res.cookie("token", jwt, { httpOnly: true, secure: true, sameSite: 'None' });

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: { _id, name, lastName, email, rol, cart_id },
      jwt,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor. Por favor, inténtelo de nuevo más tarde.",
      error: err.message,
    })
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, name, lastName } = req.body;
    req.body.password = createHash(password);

    const exists = await getUserByEmailService(email);
    if (exists) return res.status(400).send({ status: "error", error: "User already exists" });

    const cart = await createCartService();
    req.body.cart_id = cart._id;

    const response = await registerUserService(req.body);

    const { _id, rol } = response;
    const jwt = generateToken({ _id, name, lastName, email, rol });



    res.status(200).send({ status: "success", user: { _id, name, lastName, email, rol }, jwt });
  } catch (err) {
    console.log(err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {

    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET_KEY); // Decodifico el token para obtener el ID del usuario
      const user = await getUserByIdService(decoded._id);

      if (user) {
        user.last_connection = new Date(); // Actualiza la última conexión
        await user.save();
      }
    }

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'None' });
    res.status(200).send({ origin: config.SERVER });
    // res.redirect("http://127.0.0.1:5500/front/pages/login.html");
  } catch (err) {
    console.log(err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};


