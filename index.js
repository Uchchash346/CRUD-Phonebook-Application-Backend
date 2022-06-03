const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const Phonebook = require('./model/PhoneBook');

const app = express();
const port = 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hh0mo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri);

// connecting mongoDB database
// mongoose.connect(uri, { useNewUrlParser: true }).then(
//     () => { console.log('Database is connected') },
//     err => { console.log('There is problem while connecting database ' + err) }
// );

mongoose.connect(uri, { useNewUrlParser: true }).then(() => {
    console.log("Database Connected")
})

async function run() {
    try {
        await client.connect();
        const database = client.db('phoneBook');
        const servicesCollection = database.collection('phoneNumbers');

        // GET
        app.get('/users', async (req, res) => {
            const allUsers = servicesCollection.find({})
            const users = await allUsers.toArray();
            res.send(users);
        })

        // POST
        app.post('/add-user', async (req, res) => {
            const newUser = req.body;
            const result = await servicesCollection.insertOne(newUser);
            console.log("Got New User", req.body);
            console.log("Hitting the post", result);
            res.json(result);
        })

        // UPDATE
        app.put('/update-user/:id', async (req, res) => {
            const userId = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(userId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone
                },
            };
            const result = await servicesCollection.updateOne(filter, updateDoc, options);
            console.log("Updating user", req);
            res.json(result);
        })

        // DELETE
        app.delete('/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            console.log("Deleting user with id", result);
            res.json(result);
        })

    } finally {
        // await client.close
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send("Running my SERVER");
});
app.listen(port, () => {
    console.log('Running Server on Port', port)
})