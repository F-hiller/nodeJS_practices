# NodeJS_without_FRAMEWORK    
* 해당 프로젝트는 FASTCAMPUS의 강의자료를 바탕으로 진행하였음을 알립니다.

## 목표
[Notion 정리](https://www.notion.so/087cbd1e9d3045dbaaad48f5738ed5b5)  
- 프레임 워크 없이 블로그 포스트 서비스 만들어보기 (with FASTCAMPUS)
- 로컬 JSON파일로 DB대체
- auth 서비스 사용 x
- RESTful API 지향

# 프레임워크 없이 해보는 웹사이트

## 코드 및 구현

### 포트 할당 및 서버 열기

```jsx
const server = http.createServer((req, res)=>{
    res.statusCode = 200
    if(req.url === '/posts' && req.method === 'GET'){
        res.end('get!')
    }
		//생략
})
const PORT = 4000
server.listen(PORT, ()=>{
    console.log(`The server is listening at port: ${PORT}`)
})
```

### 정규 표현식(Regular Expression) /^~~~$/

~~~부분에 원하는 형식을 집어넣으면 된다.

- /\s/g : 모든 공백을 의미한다.

```jsx
else if (req.url && /^\/posts\/[a-zA-Z0-9-_]+$/.test(req.url)) {
res.end('get_id!')
}
```

[localhost:4000/posts/123](http://localhost:4000/posts/123이) 의 url이 들어오면 해당 경우로 이동하게 된다.

```jsx
//캡쳐 그룹 - 정규표현식에서 괄호()로 감싸준 부분을 확인
const POSTS_ID_REGEX = /^\/posts\/([a-zA-Z0-9-_]+)$/
//url이 정규 표현식에 맞는지 boolean값 return
POSTS_ID_REGEX.test(req.url) 
//test보다 더 구체적인 정보를 담아서 return 해준다.
//exec를 통해 들어온 정보에 캡쳐 그룹에 관한 정보 또한 포함된다.
console.log(POSTS_ID_REGEX.exec(req.url))
```

### JSDoc

주석을 통해 특정 정보(자료형 등)를 편집기에서 인식하여 에러와 같은 사항들을 안내해주는 기능이다.

posts는 정보를 담고 있는 로컬 DB역할을 한다.

```jsx
/**
 * @typedef Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * 
 */

/** @type {Post[]} */
const posts = [
    {
        id: 'my_first_post',
        title: 'My first post',
        content: 'Hello!',
    },
]
```

### JSON 출력해보기

```jsx
const result = {
            posts: posts.map((post) => ({
                id: post.id,
                title: post.title,
            })),
            totalCount: posts.length,
        }
//json 파일을 보낸다는 정보, 그 내용이 utf-8로 이루어져있다는 정보를 포함
res.setHeader('Content-Type', 'application/json; charset=utf-8')
//출력
res.end(JSON.stringify(result))
```

```jsx
//posts의 내용들 중 url로 들어온 postId와 같은 것을 찾아냄
const post = posts.find((_post)=>_post.id === postId)
```

### POST를 통해 받는 정보 확인하기

```jsx
				req.setEncoding('utf-8')
        req.on('data', (data)=>{
            const body = JSON.parse(data)
            console.log(body)
        })
```

### POST로 들어온 정보 등록하기

- body의 내용을 명확히 해주기위해서 typedef이 사용되었다.
req.on()은 POST로 들어온 정보를 처리한다.

```jsx
				req.on('data', (data)=>{
            /** @typedef CreatePostBody
             * @property {string} title
             * @property {string} content
             */

            /**@type {CreatePostBody}*/
            const body = JSON.parse(data)
            posts.push({
                id: body.title.toLowerCase().replace(' ','_'),
                title: body.title,
                content: body.content,
            })
        })
```

### 리팩토링  - Route

- 코드에서 공통적으로 진행되는 부분 확인.

ex)  statusCode 전달, res.end() 출력

- 콜백 함수에 관한 정의 - values 파트를 안적어도 된다. (여기서는 Object형을 받아서 string을 return해주는 함수라는 의미이다.)

```jsx
/**
 * @typedef Route
 * @property {(values : Object) => string} callback
 */
```

```jsx
// 다양한 형식의 typedef
/** 
 * @typedef APIResponse
 * @property {number} statusCode
 * @property {*} body
 */

/**
 * @typedef Route
 * @property {RegExp} url
 * @property {'GET'|'POST'} method
 * @property {() => Promise<APIResponse>} callback
 */
```

- 모듈 exports와 가져오기

```jsx
//======================================
// api.js
const routes = [
    {
        url: /^\/posts$/,
        method: 'GET',
        callback: async () => ({
                statusCode: 200,
                body: {},
        }),
    },
    {
        url: /^\/posts\/([a-zA-Z0-9-_]+)$/,
        method: 'GET',
        callback: async () => ({
            statusCode: 200,
            body: {},
        }),
    },
    {
        url: /^\/posts$/,
        method: 'POST',
        callback: async () => ({
            statusCode: 200,
            body: {},
        }),
    },
]

module.exports = {
    routes, 
}
//======================================
// main.js
const {routes} = require('./api')
```

- 리팩토링 적용하고 async 함수 이용하기

```jsx
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
```

### 리팩토링 - part 2

```jsx
//=========
//main.js
const regexResult = route.url.exec(req.url)
const result = await route.callback(regexResult)

//=========
//api.js
//정규표현식에 해당하는 값 전달
{
				url: /^\/posts\/([a-zA-Z0-9-_]+)$/,
        method: 'GET',
        callback: async (matches) => {
            const postId = matches[1]
				}
}
```

- request의 body 부분을 함수의 parameter로 넘겨주기 위해서 만들어 준다.
Promise에서 resolve는 비동기 처리 성공에 관한 반응, reject는 실패에 관한 반응이라고 생각하면 된다. 동기화는 요청한 정보가 들어올 때까지 기다린 후 진행하는 방식이다.

```jsx
				/** @type {Object.<string, *> | undefined} */
        const reqBody = (req.headers['content-type'] === 'application/json' &&
            ( await new Promise((resolve, reject)=>{
                req.setEncoding('utf-8')
                req.on('data', (data)=>{
                    try {
                        resolve(JSON.parse(data))
                    } catch {
                        reject(new Error('Ill-formed json'))
                    }
                })
            })
        )) || undefined
```

- 새로운 글을 추가하는 과정이다.

```jsx
{
        url: /^\/posts$/,
        method: 'POST',
        callback: async (_, body) => {
            if(!body){
                return {
                    statusCode:400,
                    body:'Ill-formed request.'
                }
            }
            /** @type {string} */
            const title = body.title
            const newPost = {
                id: title.replace(/\s/g,'_'),
                title,
                content: body.content,
            }

            posts.push(newPost)

            return{
                statusCode: 200,
                body: newPost,
            }
        },
    },
```

### JSON 파일을 이용한 임시 DB만들기

- database.json을 읽어서 posts배열을 반환해주는 함수이다.

```jsx
const fs = require('fs')

/** @returns {Promise<Post[]>} */
async function getPosts(){
    const json = await fs.promises.readFile('database.json', 'utf-8')
    return JSON.parse(json).posts
}
```

- 데이터베이스 위치를 변수로 만들어준다

```jsx
const DB_JSON_FILENAME = 'database.json'
```

- JSON파일에 정보를 저장하는 함수이다.
