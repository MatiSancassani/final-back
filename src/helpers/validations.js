import { getUserByEmailService } from "../services/users.services.js";

export const emailExists = async (email) => {
  const emailExist = await getUserByEmailService(email);
  if (emailExist) throw new Error(`The email ${email} already exists`);
};
