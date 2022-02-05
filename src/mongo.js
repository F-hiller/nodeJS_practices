// @ts-check
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://fhiller:test123@cluster0.us9id.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { 
    //@ts-ignore
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

module.exports = client
