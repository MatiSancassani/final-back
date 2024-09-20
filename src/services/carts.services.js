import cartModel from "../dao/mongo/models/carts.model.js";

//Traemos todas las propiedades dentro del cart
export const getCartByIdService = async (cid) => await cartModel.findById(cid).populate("products.id").lean();

export const createCartService = async () => await cartModel.create({});

export const addProductInCartService = async (cid, pid) => {
  const cart = await cartModel.findById(cid);

  if (!cart) {
    return null;
  }
  const productInCart = cart.products.find((p) => p.id.toString() === pid);

  if (productInCart) productInCart.quantity++;
  else cart.products.push({ id: pid, quantity: 1 });

  cart.save();

  return cart;
};

export const updateProductInCartService = async (cid, pid, quantity) =>
  await cartModel.findOneAndUpdate(
    { _id: cid, "products.id": pid },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

export const deleteProductInCartService = async (cid, pid) =>
  await cartModel.findByIdAndUpdate(cid, { $pull: { products: { id: pid } } }, { new: true });

export const deleteAllProductsService = async (cid) =>
  await cartModel.findByIdAndUpdate(cid, { $set: { products: [] } }, { new: true });
//  await cartModel.findByIdAndDelete(cid); // Eliminariamos todo el carrito
