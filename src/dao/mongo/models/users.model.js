import { mongoose, SchemaTypes } from "mongoose";

mongoose.pluralize(null);

const collection = 'user';

const usersSchema = new mongoose.Schema({

    name: { type: String, required: [true, 'Name is required'] },
    lastName: { type: String },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String },
    rol: { type: String, default: 'user', enum: ['user', 'premium', 'admin'] },
    status: { type: Boolean, required: false },
    dateOfCreation: { type: Date, default: Date.now },
    image: { type: String },
    cart_id: {
        type: SchemaTypes.ObjectId,
        ref: 'cart'
    },
    last_connection: {},
    documents: [
        {
            name: { type: String },
            reference: { type: String }
        }
    ]

}, { versionKey: false });



const usersModel = mongoose.model(collection, usersSchema);

export default usersModel;
