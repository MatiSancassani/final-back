import productsModel from "../dao/mongo/models/products.model.js";

export const getAllProductsService = async () => await productsModel.find().lean();

export const getProductByIdService = async (pid) => await productsModel.findById(pid);

export const addProductService = async ({ title, description, price, thumbnail, stock, code, status, category, owner }) =>
  await productsModel.create({
    title,
    description,
    price,
    thumbnail,
    stock,
    code,
    status,
    category,
    owner
  });

export const updateProductService = async (pid, rest) =>
  await productsModel.findByIdAndUpdate(pid, { ...rest }, { new: true }).lean();

export const deleteProductService = async (pid) => await productsModel.findByIdAndDelete(pid).lean();

class ProductsManager {
  constructor() { }
  newService = async (limit, page = 1) => {
    try {
      if (limit === 0) {
        return await productsModel.find().lean();
      } else {
        return await productsModel.paginate({}, { page: page, limit: limit, lean: true });
      }
    } catch (err) {
      return err.message;
    }
  };
}

export default ProductsManager;
