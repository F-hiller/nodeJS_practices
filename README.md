# NodeJS_without_FRAMEWORK    
## 목표
[Notion 정리](https://www.notion.so/087cbd1e9d3045dbaaad48f5738ed5b5)  
- 프레임 워크 없이 블로그 포스트 서비스 만들어보기 (with FASTCAMPUS)
- 로컬 JSON파일로 DB대체
- auth 서비스 사용 x
- RESTful API 지향

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

### 정규 표현식 /^~~~$/

~부분에 원하는 형식을 집어넣으면 된다.

```jsx
else if (req.url && /^\/posts\/[a-zA-Z0-9-_]+$/.test(req.url)) {
res.end('get_id!')
}
```

localhost:4000/posts/123 의 url이 들어오면 해당 경우로 이동하게 된다.
