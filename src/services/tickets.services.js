import ticketModel from '../dao/mongo/models/tickets.model.js';

export const addTicketService = async (ticket) => await ticketModel.create(ticket);