import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'Messages';

const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true }
}, { versionKey: false });

const messagesmodel = mongoose.model(collection, messageSchema);



export default messagesmodel;
