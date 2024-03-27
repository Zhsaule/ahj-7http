const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const cors = require('@koa/cors');

const app = new Koa();
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const uuid = require('uuid');

// => Static file handling
const public = path.join(__dirname, '/public')
app.use(koaStatic(public));

const tickets = [
  {
    id: 1,
    name: 'Service request #1',
    description: 'Description of the support request #1',
    status: 'false',
    created: new Date(2024, 0, 11, 11, 0, 0),
  },
  {
    id: 2,
    name: 'Service request #2',
    description: 'Description of the support request #2',
    status: 'false',
    created: new Date(2024, 1, 12, 12, 0, 0),
  },
  {
    id: 3,
    name: 'Service request #3',
    description: 'Description of the support request #3',
    status: 'true',
    created: new Date(2024, 2, 13, 13, 0, 0),
  }
];

// => CORS
app.use(cors({
  origin: '*',
  credentials: true,
  'Access-Control-Allow-Origin': true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// => Body Parsers
app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

// => GET/POST
app.use(async ctx => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
  });

  const { method } = ctx.request.query;
  switch (method) {
    case undefined:
      // 7070
      if (ctx.path === '/' && ctx.method === 'GET') {
        ctx.response.body = 'http: Welcome to the server!';
        return;
      }
    case 'allTickets':
      ctx.response.body = tickets.map(({description, ...ticket}) => (ticket));
      ctx.response.body = tickets;
      console.log(tickets);
      return;
    case 'ticketById':
      const {id: ticketId} = ctx.request.query;
      const ticketToShow = tickets.find(ticket => ticket.id === parseInt(ticketId));
      if (ticketToShow) {
        ctx.response.body = ticketToShow.description;
      } else {
        ctx.response.status = 404;
      }
      return;
    case 'createTicket':
      if (ctx.request.method !== 'POST') {
        ctx.response.status = 404;
        return;
      }
      const data = ctx.request.body;
      const ticket = {
        id: (data.id) ? parseInt(data.id) : (tickets[tickets.length - 1]).id + 1,
        name: data.name,
        description: data.description,
        status: (data.status) ? data.status : 'false',
        created: new Date(),
      };

      if (data.id) {
        let indexTicket = tickets.findIndex(ticket => ticket.id === parseInt(data.id));
        tickets.splice(indexTicket, 1, ticket);
      } else {
        tickets.push(ticket);
      };
      ctx.response.status = 201;
      ctx.response.body = tickets;
      return;
    case 'deleteTicket':
      if (ctx.request.method !== 'POST') {
        ctx.response.status = 404;
        return;
      }
      const {id: ticketToDelete} = ctx.request.query;
      const index = tickets.findIndex(ticket => ticket.id === parseInt(ticketToDelete));
      if (index === -1) {
        ctx.response.status = 404;
        return;
      }
      tickets.splice(index, 1);
      ctx.response.body = tickets;
      return;
    default:
      ctx.response.status = 404;
      return;
  }
});

const server = http.createServer(app.callback());
const port = 7070;
// слушаем определённый порт
server.listen(port, (err) => {
    if (err) {
      return console.log('Error occured:', error)
    }
    console.log(`****** http: server is listening on ${port} ******`)
});
