// @ts-check

const { post } = require("httpie")

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
    {
        id: 'my_sec_post',
        title: 'My sec post',
        content: 'Hello!',
    },
]

/** 
 * @typedef APIResponse
 * @property {number} statusCode
 * @property {string | Object} body
 */

/**
 * 글
 * 
 * GET /posts
 * GET /posts/:id
 * POST /posts
 */

/**
 * @typedef Route
 * @property {RegExp} url
 * @property {'GET'|'POST'} method
 * @property {(matches: string[], body: Object.<string, *> | undefined) => Promise<APIResponse>} callback
 */

/** @type {Route[]}*/
const routes = [
    {
        url: /^\/posts$/,
        method: 'GET',
        callback: async () => ({
            statusCode: 200,
            body: posts,
        }),
    },
    {
        url: /^\/posts\/([a-zA-Z0-9-_]+)$/,
        method: 'GET',
        callback: async (matches) => {
            const postId = matches[1]
            if(!postId){
                return {
                    statusCode:404,
                    body: 'Not found.',
                }
            }

            const post = posts.find(_post => _post.id === postId)
            if (!post) {
                return {
                    statusCode:404,
                    body: 'Not found.',
                }
            }

            return {
                statusCode: 200,
                body: post,
            }
        },
    },
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
]

module.exports = {
    routes,
}