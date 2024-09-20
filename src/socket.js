import { Server } from 'socket.io';
import messagesmodel from './dao/mongo/models/messages.model.js';

const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: true,  // Orígenes permitidos
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    });

    io.on('connection', async (socket) => {
        console.log('Nuevo usuario conectado');

        const messages = await messagesmodel.find();
        socket.emit('message', messages);

        socket.on('message', async (data) => {
            const newMessage = await messagesmodel.create({ ...data });
            if (newMessage) {
                const updatedMessages = await messagesmodel.find();
                io.emit('messageLogs', updatedMessages);
            }
        });
    });
};

export default initSocket;