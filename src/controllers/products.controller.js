import {
  getAllProductsService,
  getProductByIdService,
  addProductService,
  updateProductService,
  deleteProductService,
} from "../services/products.services.js";
import { getUserByEmailService } from "../services/users.services.js";
import config from "../config.js";
import nodemailer from "nodemailer";

export const getProduct = async (req, res) => {
  try {
    const products = await getAllProductsService();
    res.status(200).send({ origin: config.SERVER, payload: products });
  } catch (err) {
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { pid } = req.params;
    // const product = await getByIdService(pid);
    const product = await getProductByIdService(pid);
    if (!product) {
      res.status(404).send({ msg: "El producto no existe" });
    }
    res.status(200).send({ origin: config.SERVER, payload: product });
  } catch (err) {
    console.log("getById ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const productBody = req.body;
    const thumbnail = req.file ? `${config.SERVER_UPLOAD_PATH}/products/${req.file.filename}` : ''; // URL pública para la imagen
    const producto = { ...productBody, owner: req.user.email, thumbnail };

    const product = await addProductService(producto);
    res.status(200).send({
      origin: config.SERVER,
      payload: { msg: "Producto agregado exitosamente", product },
    });
  } catch (err) {
    console.log("add ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const { _id, ...rest } = req.body;
    const { email } = req.user;

    const product = await getProductByIdService(pid);

    if (product.owner !== email) {
      return res.status(403).send({ msg: "No puedes editar un producto que no te pertenece" });
    } else {
      const producto = await updateProductService(pid, rest);
      res.status(200).send({ origin: config.SERVER, payload: { msg: "Producto editado", producto } });
    }

  } catch (err) {
    console.log("update ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const { email, rol } = req.user;

    const product = await getProductByIdService(pid);
    console.log(product)

    // Si el usuario es admin, también necesitamos comprobar si el dueño es premium
    if (rol === "admin") {
      await deleteProductService(pid);

      // Comprobar si el dueño del producto es premium
      const productOwner = await getUserByEmailService(product.owner); // Asegúrate de tener esta función que devuelve el dueño
      if (productOwner.rol === "premium") {
        await sendProductDeletedEmail(productOwner.email, product);
      }

      return res.status(200).send({ origin: config.SERVER, payload: { msg: "Producto eliminado" } });
    }

    // Si el usuario no es admin, comprobar si es el dueño
    if (product.owner !== email) {
      return res.status(403).send({ msg: "No puedes eliminar un producto que no te pertenece" });
    } else {
      // Eliminar el producto
      const producto = await deleteProductService(pid);

      // Si el usuario es premium, enviar un correo informando de la eliminación del producto
      if (rol === "premium") {
        await sendProductDeletedEmail(email, product);
      }

      return res.status(200).send({ origin: config.SERVER, payload: { msg: "Producto eliminado", producto } });
    }
  } catch (err) {
    console.log("remove ->", err);
    return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

// Función para enviar correo cuando un producto es eliminado
const sendProductDeletedEmail = async (email, product) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS,
      },
    });

    const mailOptions = {
      from: config.GMAIL_APP_USER,
      to: email,
      subject: 'Producto eliminado',
      html: `
        <h1>Tu producto ha sido eliminado</h1>
        <p>Hola,</p>
        <p>Te informamos que tu producto <strong>${product.title}</strong> ha sido eliminado del sistema.</p>
        <p>Si tienes alguna duda, no dudes en contactarnos.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
  } catch (err) {
    console.error('Error al enviar el correo:', err);
  }
};
