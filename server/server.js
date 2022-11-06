const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json())

var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: 'f1ce2b237ca44f6498f81e005cf038d9',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

rollbar.log('Hello world!')

const pets = ['Mocha', 'Pedro']

app.get('/', (req, res) => {
    rollbar.info("HTML served successfully.")
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/pets', (req, res) => {
    rollbar.info("Pets have been loaded.")
    res.status(200).send(pets)
})

app.post('/api/pets', (req, res) => {
   let {name} = req.body

   const index = pets.findIndex(pet => {
       return pet === name
   })

   try {
       if (index === -1 && name !== '') {
           rollbar.log("Pet added successfully.", {author: "Lily", type: "manual entry"});
           pets.push(name)
           res.status(200).send(pets)
       } else if (name === ''){
           rollbar.error("No name provided");
           res.status(400).send('You must enter a name.')
       } else {
           rollbar.error("Pet already exists.")
           res.status(400).send('That pet already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/pets/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    pets.splice(targetIndex, 1)
    res.status(200).send(pets)
})

app.use(rollbar.errorHandler());

const port = process.env.PORT || 4005;

app.listen(port, ()=> {
    console.log(`Running on port ${port}`);
});