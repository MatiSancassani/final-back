import { Router } from "express";
import {
  getCartById,
  addCart,
  addProductInCart,
  updateProductInCart,
  deleteProductInCart,
  deleteAllProducts,
  getCartIdService,
} from "../controllers/carts.controller.js";
import { getCartByIdService } from "../services/carts.services.js";
import { pucharseCart } from "../controllers/carts.controller.js";
import { validateJWT } from "../middleware/auth.js";

const router = Router();



router.get("/", validateJWT, getCartIdService);
router.get("/:cid", validateJWT, getCartById);
// router.post("/", addCart);
router.post("/:cid/product/:pid", validateJWT, addProductInCart);
router.put("/:cid/products/:pid", validateJWT, updateProductInCart);
router.delete("/:cid/products/:pid", validateJWT, deleteProductInCart);
router.delete("/:cid", validateJWT, deleteAllProducts);

router.post("/:cid/purchase", validateJWT, async (req, res) => {
  const cid = req.params.cid;
  const cart = await getCartByIdService(cid);
  if (cart) {
    const cartFiltered = await pucharseCart(cart);
    res.status(200).send({
      status: "Ok",
      payload: cartFiltered,
      mensaje: `Cierre del carrito con id ${cid}`,
    });
  } else {
    res.status(400).send({
      status: "False",
      payload: [],
      error: `El carrito buscado con id ${cid} no existe`,
    });
  }
});

export default router;
