import { v4 as uuidv4 } from "uuid";
import {
  getCartByIdService,
  createCartService,
  addProductInCartService,
  updateProductInCartService,
  deleteProductInCartService,
  deleteAllProductsService,
} from "../services/carts.services.js";
import { getProductByIdService, updateProductService } from "../services/products.services.js";
import { getUserByIdService } from "../services/users.services.js";
import { addTicketService } from "../services/tickets.services.js";

import config from "../config.js";

export const getCartIdService = async (req, res) => {
  try {
    const cartId = req.user.cart_id;
    res.status(200).send({ origin: config.SERVER, cartId });
  } catch (error) {
    console.log("getCartId ->", error);
    res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
  }
}
export const getCartById = async (req, res) => {
  try {
    const { cid } = req.params;
    // const cart = await getCartByIdService(cid); //Traemos todas las propiedades dentro del cart
    const cart = await getCartByIdService(cid);

    res.status(200).send({ origin: config.SERVER, payload: { cart } });
  } catch (error) {
    console.log("getCartById ->", error);
    res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
  }
};

export const addCart = async (req, res) => {
  try {
    const cart = await createCartService();
    // const cart = await CartsRepository.createCart();
    res.status(200).send({ origin: config.SERVER, payload: cart });
  } catch (err) {
    console.log("addCart ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const addProductInCart = async (req, res) => {
  try {
    const { _id } = req.user;
    const { cid, pid } = req.params;

    const user = await getUserByIdService(_id);
    const product = await getProductByIdService(pid);

    if (!product) return res.status(400).send({ msg: "Product no existe" });

    const cartUser = user.cart_id._id.toString();

    if (!(cartUser === cid)) return res.status(400).send({ msg: 'No puedes agregar productos a un carrito que no te pertenece' });

    if (user.rol === 'user') {
      return res.status(400).send({ msg: 'Requieres rol Premium para agregar productos al carrito' });
    }

    if (user.rol === 'premium' && product.owner === user.email) {
      return res.status(400).send({ msg: 'No puedes agregar tu propio producto al carrito' });
    }

    const cart = await addProductInCartService(cid, pid);

    if (!cart) {
      console.log('El carrito no existe')
    }
    res.status(200).send({ origin: config.SERVER, payload: cart });
  } catch (err) {
    console.log("addProductInCart ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const updateProductInCart = async (req, res) => {
  try {
    const { _id } = req;
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const user = await getUserByIdService(_id);
    const product = await getProductByIdService(pid);
    // if(!(user.cart_id.toString() === cid)) return res.status(400).send( {msg: 'Cart no valido'});
    if (!product) return res.status(400).send({ msg: "Product no existe" });

    if (!quantity || !Number.isInteger(quantity)) {
      console.log("Debe ser un numero entero");
    }
    // const cart = await updateProductInCartService(cid, pid, quantity);
    const cart = await updateProductInCartService(cid, pid, quantity);
    res.status(200).send({ origin: config.SERVER, payload: { cart } });
  } catch (err) {
    console.log("updateProductInCart ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const deleteProductInCart = async (req, res) => {
  try {
    const { _id } = req;
    const { cid, pid } = req.params;

    const user = await getUserByIdService(_id);
    const product = await getProductByIdService(pid);
    // if(!(user.cart_id.toString() === cid)) return res.status(400).send( {msg: 'Cart no valido'});
    if (!product) return res.status(400).send({ msg: "Product no existe" });

    // const cart = await deleteProductInCartService(cid,pid);
    const cart = await deleteProductInCartService(cid, pid);

    res.status(200).send({ origin: config.SERVER, payload: { cart } });
  } catch (err) {
    console.log("deleteProductInCart ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const deleteAllProducts = async (req, res) => {
  try {
    const { cid } = req.params;
    // const cart = await deleteAllProductsService(cid);
    const cart = await deleteAllProductsService(cid);

    // const cart = await cartModel.findByIdAndDelete(cid); // Eliminariamos todo el carrito
    res.status(200).send({ origin: config.SERVER, payload: { cart } });
  } catch (err) {
    console.log("deleteAllProducts ->", err);
    res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
  }
};

export const pucharseCart = async (cart) => {
  try {
    let totalTicket = 0;
    let cartUpdate = [];

    for (let i = 0; i < cart.products.length; i++) {
      if (cart.products[i].id.stock >= cart.products[i].quantity) {
        console.log("Si alcanza", cart.products[i]);

        totalTicket = +(cart.products[i].quantity * cart.products[i].id.price);

        const amountNewStock = cart.products[i].id.stock - cart.products[i].quantity;

        const prodEdit = await updateProductService(cart.products[i].id._id, {
          stock: amountNewStock,
        });
        cartUpdate = cart.products.splice(i, 1);
        i--; // Reduce el i para reajustarlo al haber quetado un elemento.
      } else {
        console.log("There is not enough stock");
      }
    }
    if (totalTicket > 0) {
      const ticket = {
        code: uuidv4(),
        amount: totalTicket,
        purchaser: "da",
      };

      const ticketAdd = await addTicketService(ticket);
    }
    const cartResult = await updateProductInCartService();
    return cartResult;
  } catch (error) {
    console.log("Error when deleting complete the purchase");
    console.log(error);
  }
};
