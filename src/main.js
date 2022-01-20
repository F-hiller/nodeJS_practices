// @ts-check

/** 
 * 프레임 워크 없이 블로그 포스트 서비스 만들어보기 (with FASTCAMPUS)
 * -로컬 JSON파일로 DB대체
 * -auth 서비스 사용 x
 * -RESTful API 지향
 */
const http = require('http')
const { routes } = require('./api')

const server = http.createServer((req, res) => {
    async function main() {
        const route = routes.find(
            (_route) =>
                req.url &&
                req.method &&
                _route.url.test(req.url) &&
                _route.method === req.method
        )
        if (!route) {
            res.statusCode = 404
            res.end('Not found.')
            return
        }
        //api response
        const result = await route.callback()
        res.statusCode = result.statusCode
        if(typeof result.body === 'string'){
            res.end(result.body)
        }
        else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(result.body))
        }
    }
    main()
})

const PORT = 4000

server.listen(PORT, () => {
    console.log(`The server is listening at port: ${PORT}`)
})