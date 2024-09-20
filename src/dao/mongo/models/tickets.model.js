import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'tickets';

const schema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true }
},
{
    timeStamps: true
}, { versionKey: false });

const ticketModel = mongoose.model(collection, schema);

export default ticketModel;