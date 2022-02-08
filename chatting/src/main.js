// @ts-check
const PORT = 5000

const Koa = require('koa')
const route = require('koa-route')
const websockify = require('koa-websocket')
const serve = require('koa-static')
const mount = require('koa-mount')
const Pug = require('koa-pug')
const path = require('path')
const mongoClient = require('./mongo')

const app = websockify(new Koa());

//@ts-ignore
new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
})

app.use(mount('/public', serve('src/public')))

app.use(async (ctx) => {
  await ctx.render('main')
})

const _client = mongoClient.connect()
async function getChatsCollection() {
  const client = await _client
  return client.db('chat').collection('chats')
}

app.ws.use(route.all('/ws', async (ctx) => {
  const chatsCollection = await getChatsCollection()
  const chatsCursor = chatsCollection.find(
    {},
    {
      sort: {
        createdAt: 1,
      },
    })

  const chats = await chatsCursor.toArray()
  ctx.websocket.send(JSON.stringify({
    type: 'sync',
    payload: {
      chats,
    },
  }))

  ctx.websocket.on('message', async (data) => {
    if (typeof data !== 'string') {
      return
    }
    const chat = JSON.parse(data)
    await chatsCollection.insertOne({
      ...chat,
      createdAt: new Date(),
    })

    const { message, nickname } = chat

    const { server } = app.ws
    if (!server) {
      return
    }
    server.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'chat',
        payload: {
          message,
          nickname,
        },
      }))
    })

  });
}));


app.listen(PORT)