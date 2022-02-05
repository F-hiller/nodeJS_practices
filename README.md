# Chatting_with_NodeJS

# 실시간 채팅 서비스

## 요구사항

1. 간단한 실시간 채팅 서비스
2. 인증 구현 x
3. 데이터베이스에 채팅 내역을 저장해서 활용

## 기본 계획

1. express 대신 koa라는 웹 프레임워크 사용해보기
2. MongoDB 사용
3. koa-websocket 사용
4. pug 템플릿 엔진 사용
5. TailwindCSS 프레임워크 사용
- koa 기본 사용

```jsx
const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
	ctx.body = 'Hello World'
})

app.listen(3000)
```

## 사용자에게 보여지는 화면 - Frontend

### Koa

- koa는 express와 유사한 점이 많다.

```jsx
npm install koa
npm install koa-pug
```

---

- koa에서 next는 await을 통한 리턴이 존재해서 다음과 같은 일이 가능하다.

```jsx
app.use(async (ctx, next) => {
    ctx.body = 'Hello World!'
    await next()
		//가장 마지막에 실행되는 부분
    ctx.body = `[${ctx.body}]`
})

app.use(async (ctx) => {
    ctx.body = `<${ctx.body}>`
})

//실행 결과
[<Hello World!>]
```

### tailwindCSS

- vscode extension 설치

```jsx
npm install tailwindCSS
```

- /.vscode/setting.json

```jsx
{
    "tailwindCSS.emmetCompletions": true
}
```

- main.pug
- backend를 연습하기 위한 프로젝트이므로 굳이 CSS문법을 익힐 필요는 없다.

```jsx
html 
    head 
        link(href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet")
    body 
        h1.bg-gradient-to-r.from-purple-100.to-gray-200.p-16.text-4xl.font-bold 실시간 채팅 서비스
        div.p-16.space-y-8
            div.bg-gray-100.p-2 채팅 목록
            form.space-x-4.flex
                input.flex-1.border.border-gray-200.p-4.rounded(placeholder="채팅을 입력하세요. : ")
                button.bg-blue-600.text-white.p-2.rounded 전송
```

- koa, pug, tailwindCSS가 포함된 main.js

```jsx
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
```

### koa의 다양한 package

- koa-route
- koa-websocket

```jsx
app.ws.use(route.all('/ws', (ctx) => {
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', function (message) {
    console.log(message);
  });
}));
```

- koa-static
- koa-mount

```jsx
app.use(mount('/public', serve('src/public')))
```

## Socket 통신

- /src/public/client.js

IIFE : 즉시 실행 함수 표현이라고 불리는 이 방식은 전역 스코프에 불필요한 변수를 추가해서 오염시키는 것을 방지할 수 있을 뿐 아니라 IIFE 내부안으로 다른 변수들이 접근하는 것을 막을 수 있는 방법이다.

```jsx
;(() => {})()
```

```jsx
//@ts-check

//IIFE
;(() => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)
})()

alert('client.js is loaded!')
```

### 서버와 클라이언트간의 통신해보기

- 서버 → 클라이언트

```jsx
//websocket
app.ws.use(route.all('/ws', (ctx) => {
	//클라이언트에서 보낸 message 받기
  ctx.websocket.on('message', (message) => {
    console.log(message)
    //server에서 client로 보내기
    ctx.websocket.send('Hello client!')
  });
}));
```

- 클라이언트 → 서버

```jsx
;(() => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)

    //client에서 서버로 보내기
    socket.addEventListener('open', () => {
        socket.send('Hello server!')
    })
		//서버에서 보낸 message 받기
    socket.addEventListener('message', (event) => {
        alert(event.data)
    })
})()
```

### 채팅 보내기

- client.js

```jsx
	//pug의 form이라는 Id값을 가진 것을 읽어온다.
    const formEl = document.getElementById('form')
    /** @type {HTMLInputElement | null} */
    //@ts-ignore
    const inputEl = document.getElementById('input')

    if (!formEl || !inputEl) {
        throw new Error('Init failed!')
    }

    //form의 버튼을 통해 전송 이벤트가 일어날때 화면 새로고침(refresh)을 하지 않겠다.
    formEl.addEventListener('submit', (event) => {
        event.preventDefault()
        //입력 창의 text를 전송
        socket.send(inputEl.value)
        inputEl.value = ''
    })
```

- pug

#form, #input, #send가 Id가 된다.

```jsx
form#form.space-x-4.flex
 input#input.flex-1.border.border-gray-200.p-4.rounded(placeholder="채팅을 입력하세요. : ")
 button#send.bg-blue-600.text-white.p-2.rounded 전송
```

- 데이터 전송 규격을 맞춰주기 위해서 JSON 형식으로 만들어서 보내준다.
- 하지만 JSON 자체는 send할 수 없기에 stringfy를 통해서 보내준다.

```jsx
//client.js
				socket.send(JSON.stringify({
            nickname: '멋진 물범',
            message: inputEl.value,
        }))
```

- 서버로 들어온 정보를 다시 클라이언트로 되돌려준다.

```jsx
//main.js
app.ws.use(route.all('/ws', (ctx) => {
  ctx.websocket.on('message', (data) => {
    if (typeof data !== 'string') {
      return
    }
    const { message, nickname } = JSON.parse(data)
    ctx.websocket.send(JSON.stringify({
      message,
      nickname,
    }))
  });
}));
```

- 채팅을 저장할 공간 선언

```jsx
		/**
     * @typedef Chat
     * @property {string} nickname
     * @property {string} message
     */
    /** @type Chat[] */
    const chats = []
```

- 서버로부터 받은 정보를 message와 nickname으로 분리해서 chatsEl에 한줄씩 추가

```jsx
		socket.addEventListener('message', (event) => {
        chats.push(JSON.parse(event.data))

        chatsEl.innerHTML = ''

        chats.forEach(({message, nickname}) => {
            const div = document.createElement('div')
            div.innerHTML = `${nickname} : ${message}`
            chatsEl.appendChild(div)
        })
    })
```

다음 실행 예시로 이해하면 좋을 것 같다.

```jsx
<div class="bg-gray-100 p-2" id="chats">
	<div>멋진 물범 : a</div>
	<div>멋진 물범 : s</div>
</div>

//d라는 채팅을 전송한 후 결과
<div class="bg-gray-100 p-2" id="chats">
	<div>멋진 물범 : a</div>
	<div>멋진 물범 : s</div>
	<div>멋진 물범 : d</div>
</div>
```

- 현재의 코드는 입력을 보낸 클라이언트에만 채팅 내역을 추가해준다. 이를 해결하기 위해
브로드캐스트 과정이 필요하고 다음과 같이 사용할 수 있다.

```jsx
		const {server} = app.ws
    if (!server) {
      return
    }
    server.clients.forEach(client => {
      client.send(JSON.stringify({
        message,
        nickname,
      }))
    })
```

## 채팅 저장하고 관리하기

### 채팅 저장하기

- /src/mongo.js

```jsx
// @ts-check
const { MongoClient } = require('mongodb');
// <password> 부분은 실제 비밀번호로 적어야한다.<>도 지워야한다.
const uri = `mongodb+srv://fhiller:${process.env.MONGO_PASSWORD}@cluster0.us9id.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { 
    //@ts-ignore
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

module.exports = client
```

- main.js

mongoClient.connect()가 여러번 불리는 것을 방지하였으며

chats 콜렉션을 가져다주는 함수이다.

```jsx
const _client = mongoClient.connect()
async function getChatsCollection(){
  const client = await _client
  return client.db('chat').collection('chats')
}
```

- 마지막에 쓴 내용이 리스트의 마지막에 와야하므로 정렬 기준을 날짜로 하고 그것을 콜렉션에 추가해준다.

```cpp
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
```

```cpp
		const chat = JSON.parse(data)
    await chatsCollection.insertOne({
      ...chat,
      createdAt: new Date(),
    })

		server.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'chat',
        payload: {
          message,
          nickname,
        },
      }))
    })
```

- 기존의 내용들은 drawChats라는 함수로 빼주고 추가해준 내용들을 클라이언트에서 받아서 각각의 타입에 맞게 출력해준다.
