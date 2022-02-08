// @ts-check

//@ts-ignore
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
//const fetch = import('node-fetch')
const { createApi } = require('unsplash-js')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream')
const { promisify } = require('util')
const sharp = require('sharp')

const unsplash = createApi({
  accessKey: 'Kln9VvirfKAAnFtK2xYnVxM-HYfUlPdPvDoAxoEcQGM',
  //@ts-ignore
  fetch,
})

/** 
 * @param {string} query
 */
async function searchImage(query) {
  const result = await unsplash.search.getPhotos({ query })

  if (!result.response) {
    throw new Error('Failed to search image.')
  }
  const image = result.response.results[0]

  if (!image) {
    throw new Error('No image found.')
  }
  return {
    description: image.description || image.alt_description,
    url: image.urls.regular,
  }
}
/** 
 * @param {string} query
 */
async function getCachedImageOrSearchedImage(query) {
  const imageFilePath = path.resolve(__dirname, `../images/${query}`)

  if (fs.existsSync(imageFilePath)) {
    return {
      stream: fs.createReadStream(imageFilePath),
      message: `Returning cached image.`
    }
  }

  const result = await searchImage(query)
  const resp = await fetch(result.url)

  await promisify(pipeline)(
    //@ts-ignore
    resp.body,
    fs.createWriteStream(imageFilePath),
  )
  
  return {
    stream: fs.createReadStream(imageFilePath),
    message: `Returning new image.`
  }
}

/**
 * @param {string} url
 */
function convertURLTOImageInfo(url) {
  const urlObj = new URL(url, 'http://localhost:5000')
  const widthStr = urlObj.searchParams.get('width')
  const heightStr = urlObj.searchParams.get('height')
  const width = widthStr ? parseInt(widthStr, 10) : 400
  const height = heightStr ? parseInt(heightStr, 10) : 400
  return {
    query:urlObj.pathname.slice(1),
    width,
    height,
  }
}

const server = http.createServer((req, res) => {
  async function main() {
    if (!req.url) {
      res.statusCode = 400
      res.end('Need URL.')
      return
    }
    const {query, width, height} = convertURLTOImageInfo(req.url)
    try {
      const { message, stream } = await getCachedImageOrSearchedImage(query)

      await promisify(pipeline)(
        stream,
        sharp().resize(width, height, {
          fit: 'contain',
          background: '#ffffff',
        }).png(),
        res,
      )
      console.log(message, width) 
      stream.pipe(res)
    } catch (error) {
      res.statusCode = 400
      res.end()
    }
  }
  main()
})

const PORT = 5000

server.listen(PORT, () => {
  console.log('The server is listening at port', PORT)
})