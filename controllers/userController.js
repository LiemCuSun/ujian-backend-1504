// import module yang dibutuhkan
const { validationResult, check } = require('express-validator')
const cryptojs = require('crypto-js')
const handlebars = require('handlebars')
const fs = require('fs')

// import helpers
const { generateQuery, asyncQuery } = require('../helpers/queryHelp')
const { createToken } = require('../helpers/jwt')

// import database connection
const db = require('../database')

// import dotenv
const SECRET_KEY = "!@#$%^&*"


// export controller
module.exports = {
    getAllUser: (req, res) => {
        const userQuery = 'SELECT * FROM users'
        db.query(userQuery, (err, result) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(result)
        })
    },
    login: (req, res) => {
        const { username, password, email } = req.body

        // hashing password
        const hashpass = cryptojs.HmacMD5(password, SECRET_KEY)

        const loginQuery = `SELECT id, uid, username, email, status, role FROM users
                            WHERE (username= ${db.escape(username)}
                            AND password=${db.escape(hashpass.toString())})
                            OR (email= ${db.escape(email)}
                            AND password=${db.escape(hashpass.toString())})`
        // console.log(loginQuery)

        db.query(loginQuery, (err, result) => {
            if (err) return res.status(500).send(err)

            // result bentuknya array of object
            // console.log(result)

            // cek apakah login berhasil
            if (result.length === 0) return res.status(400).send('Username/Email or Password is wrong')

            // create token
            let token = createToken({ uid: result[0].uid, role: result[0].role })

            // console.log(result[0])

            // input token to result
            result[0].token = token
            req.user = token

            // console.log(result[0])

            res.status(200).send(result[0])
        })
        // res.status(200).send('testing login')
    },
    register: async (req, res) => {
        const { username, password, email } = req.body

        // validation input from user
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg)

        // encrypt password with crypto js
        // data yang sudah di encrypt oleh crypto js, TIDAK BISA di decrypt
        const hashpass = cryptojs.HmacMD5(password, SECRET_KEY)
        // console.log('password : ', hashpass.toString())

        try {
            // kalau tidak ada error, proses penambahan data user baru berjalan
            const checkUser = `SELECT * FROM users 
                              WHERE username=${db.escape(username)}
                              OR email=${db.escape(email)}`
            const resCheck = await asyncQuery(checkUser)

            if (resCheck.length !== 0) return res.status(400).send('Username or Email is already exist')

            const regQuery = `INSERT INTO users (uid, username, password, email)
                              VALUES (${db.escape(Date.now())} ,${db.escape(username)}, ${db.escape(hashpass.toString())}, ${db.escape(email)})`
            const resRegister = await asyncQuery(regQuery)
            console.log(resRegister)


            const userQuery = `SELECT id, uid, username, email FROM users where username = ${db.escape(username)}`
            db.query(userQuery, (err, result) => {
                if (err) return res.status(500).send(err)

                // create token
                let token = createToken({ uid: result[0].uid, role: result[0].role })

                // console.log(result[0])

                // input token to result
                result[0].token = token

                res.status(200).send(result[0])
            })
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    deactiveAcc: async (req, res) => {
        console.log(req.user)
        console.log('deactiveAcc')

        try {
            // query to get data from database
            const getUser = `SELECT uid FROM users
            WHERE uid='${req.user.uid}'`
            
            const result = await asyncQuery(getUser)
            console.log('result dari query', result[0])

            

            const editStatus = `UPDATE users SET status = 2 WHERE uid=${req.user.uid}`
            const result2 = await asyncQuery(editStatus)

            let status = 'deactive'
            result[0].status = status

            res.status(200).send(result[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    activateAcc: async (req, res) => {
        console.log(req.user)
        console.log('ActivateAcc')

        try {
            // query to get data from database
            const getUser = `SELECT uid FROM users
            WHERE uid='${req.user.uid}'`
            
            const result = await asyncQuery(getUser)
            console.log('result dari query', result[0])

            

            const editStatus = `UPDATE users SET status = 1 WHERE uid=${req.user.uid}`
            const result2 = await asyncQuery(editStatus)

            let status = 'active'
            result[0].status = status

            res.status(200).send(result[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    closeAcc: async (req, res) => {
        console.log(req.user)
        console.log('closeAcc')

        try {
            // query to get data from database
            const getUser = `SELECT uid FROM users
            WHERE uid='${req.user.uid}'`
            
            const result = await asyncQuery(getUser)
            console.log('result dari query', result[0])

            

            const editStatus = `UPDATE users SET status = 3 WHERE uid=${req.user.uid}`
            const result2 = await asyncQuery(editStatus)

            let status = 'closed'
            result[0].status = status

            res.status(200).send(result[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    edit: (req, res) => {
        const id = parseInt(req.params.id)

        // validation input from user
        const errors = validationResult(req)
        console.log(errors.errors)

        const errUsername = errors.errors.filter(item => item.param === 'username' && item.value !== undefined)
        console.log(errUsername)
        if (errUsername.length !== 0) return res.status(400).send(errUsername[0].msg)

        const errEmail = errors.errors.filter(item => item.param === 'email' && item.value !== undefined)
        console.log(errEmail)
        if (errEmail.length !== 0) return res.status(400).send(errEmail[0].msg)


        const checkUser = `SELECT * FROM users WHERE id_users=${db.escape(id)}`
        // console.log(checkUser)

        db.query(checkUser, (err, result) => {
            if (err) return res.status(500).send(err)

            // if id_users not found
            if (result.length === 0) return res.status(200).send(`User with id : ${id} is not found`)

            const editUser = `UPDATE users SET${generateQuery(req.body)} WHERE id_users=${id}`
            // console.log(editUser)
            db.query(editUser, (err2, result2) => {
                if (err2) return res.status(500).send(err2)

                res.status(200).send(result2)
            })
        })
    },
    editPass: (req, res) => {
        const id = parseInt(req.params.id)

        // validation input from user
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg)

        const checkUser = `SELECT * FROM users WHERE id_users=${db.escape(id)}`
        // console.log(checkUser)

        db.query(checkUser, (err, result) => {
            if (err) return res.status(500).send(err)

            // if id_users not found
            if (result.length === 0) return res.status(200).send(`User with id : ${id} is not found`)

            const hashpass = cryptojs.HmacMD5(req.body.password, SECRET_KEY)

            // query change password
            const editPassword = `UPDATE users SET password=${db.escape(hashpass.toString())} WHERE id_users=${id}`
            // console.log(editPassword)

            db.query(editPassword, (err2, result2) => {
                if (err2) return res.status(500).send(err2)

                res.status(200).send(result2)
            })
        })
    },
    delete: (req, res) => {
        const checkUser = `SELECT * FROM users WHERE id_users=${db.escape(parseInt(req.params.id))}`

        db.query(checkUser, (err, result) => {
            if (err) return res.status(500).send(err)

            // if id_users not found
            if (result.length === 0) return res.status(200).send(`User with id : ${parseInt(req.params.id)} is not found`)

            const deleteUser = `DELETE FROM users WHERE id_users=${parseInt(req.params.id)}`

            db.query(deleteUser, (err2, result2) => {
                if (err2) return res.status(500).send(err2)

                res.status(200).send(result2)
            })

        })
    },
    keepLogin: async (req, res) => {
        console.log(req.user)
        console.log('keep login')

        try {
            // query to get data from database
            const getUser = `SELECT * FROM users
            LEFT JOIN profile
            USING(id_users)
            WHERE username='${req.user.username}'`

            const result = await asyncQuery(getUser)
            // console.log('result dari query', result[0])

            res.status(200).send(result[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    }
}