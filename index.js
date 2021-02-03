const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')

// main app
const app = express()

// apply middleware
app.use(cors())
app.use(bodyparser.json())

// NOTE import Connection MySql
const connection = require('./database')

// main route
const response = (req, res) => res.status(200).send('<h1>REST API JCWM1504</h1>')
app.get('/', response)

// NOTE import router
let {userRouter, movieRouter} = require('./routes')
app.use('/user' ,userRouter)
app.use('/movies' ,movieRouter)


// NOTE connect database
connection.connect((err) => {
    if (err) return console.log(`Oops something wrong ! error code: ${err.stack}`)
    console.log(`connected as id : ${connection.threadId}`)
})




// bind to local machine
const PORT = process.env.PORT || 2000
app.listen(PORT, () => `CONNECTED : port ${PORT}`)