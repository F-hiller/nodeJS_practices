// @ts-check
const PORT = 5000

const Koa = require('koa')
const path = require('path')
const Pug = require('koa-pug')

const app = new Koa()

//@ts-ignore
new Pug({
    viewPath: path.resolve(__dirname, './views'),
    app,
  })


app.use(async (ctx) => {
    await ctx.render('main')
})

app.listen(PORT)