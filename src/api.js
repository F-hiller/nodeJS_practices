// @ts-check

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
 * @property {() => Promise<APIResponse>} callback
 */

/** @type {Route[]}*/
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