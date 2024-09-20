// import { UsersRepository } from "../../repository/index.js";
import usersModel from "../dao/mongo/models/users.model.js";

export const getUserByIdService = async (id) => await usersModel.findById(id).populate('cart_id');

export const getUserByEmailService = async (email) => await usersModel.findOne({ email });

export const registerUserService = async (user) => await usersModel.create({ ...user });

export const getAllUsers = async () => await usersModel.find().lean();

export const findByIdAndUpdateRol = async () => await usersModel.findByIdAndUpdate(id, { rol }, { new: true }).lean();

export const deleteUserService = async (id) => await usersModel.findByIdAndDelete(id);
