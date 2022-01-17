// @ts-check

/** 
 * 프레임 워크 없이 블로그 포스트 서비스 만들어보기 (with FASTCAMPUS)
 * -로컬 JSON파일로 DB대체
 * -auth 서비스 사용 x
 * -RESTful API 지향
 */
const http = require('http')

/**
 * 글
 * 
 * GET /posts
 * GET /posts/:id
 * POST /posts
 */

const server = http.createServer((req, res)=>{
    
    res.statusCode = 200
    if(req.url === '/posts' && req.method === 'GET'){
        res.end('get!')
    }
    //정규 표현식 "/^ ~~~ $/"
    else if (req.url && /^\/posts\/[a-zA-Z0-9-_]+$/.test(req.url)) {
        res.end('get_id!')
    }
    else if (req.url === '/posts' && req.method === 'POST') {
        res.end('posts!')
    }
    else{
        res.statusCode = 404
        res.end('Not found.')
    }
})

const PORT = 4000

server.listen(PORT, ()=>{
    console.log(`The server is listening at port: ${PORT}`)
})