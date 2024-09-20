import jwt from 'jsonwebtoken';

import config from '../config.js';

export const generateToken = (user) => {
   try {
      return jwt.sign({ ...user }, config.JWT_SECRET_KEY, { expiresIn: '1h' });
   } catch (error) {
      console.log(error)
      throw error;
   }
}

export const tokenEmail = (user) => {
   try {
      return jwt.sign({ ...user }, config.JWT_SECRET_KEY, { expiresIn: '5m' })
   } catch (error) {
      console.log(error)
      throw error;
   }
}