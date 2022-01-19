// @ts-check

/** 
 * 프레임 워크 없이 블로그 포스트 서비스 만들어보기 (with FASTCAMPUS)
 * -로컬 JSON파일로 DB대체
 * -auth 서비스 사용 x
 * -RESTful API 지향
 */
const http = require('http')
const { post } = require('httpie')

/**
 * 글
 * 
 * GET /posts
 * GET /posts/:id
 * POST /posts
 */

const server = http.createServer((req, res) => {
    const POSTS_ID_REGEX = /^\/posts\/([a-zA-Z0-9-_]+)$/
    const postIdRegexResult = (req.url && POSTS_ID_REGEX.exec(req.url)) || undefined
    res.statusCode = 200

    if (req.url === '/posts' && req.method === 'GET') {
        res.end('get!')
    }
    else if (postIdRegexResult) {
        // GET /posts/:id
        const postId = postIdRegexResult[1]
        console.log(`postId : ${postId}`)
        res.end(`post and id checking`)
    }
    else if (req.url === '/posts' && req.method === 'POST') {
        res.end('creating posts!')
    }
    else {
        res.statusCode = 404
        res.end('Not found.')
    }
})

const PORT = 4000

server.listen(PORT, () => {
    console.log(`The server is listening at port: ${PORT}`)
})