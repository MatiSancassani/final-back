import { Router } from "express";
import {
  getProduct,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
import { validateJWT } from "../middleware/auth.js";
import { handlePolicies } from "../utils/verifys.js";
import { uploader } from "../utils/uploader.js";

const router = Router();

router.get("/", validateJWT, getProduct);
router.get("/:pid", validateJWT, getProductById);
router.post("/", validateJWT,
  handlePolicies(["admin", "premium"]),
  uploader('products').single('productsImages'),
  addProduct);
router.put("/:pid", validateJWT, updateProduct);
router.delete("/:pid", validateJWT, deleteProduct);

export default router;
