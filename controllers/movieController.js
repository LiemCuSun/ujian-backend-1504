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
const { query } = require('express')

// import dotenv
const SECRET_KEY = "!@#$%^&*"


// export controller
module.exports = {
    getAllMovie: (req, res) => {
        const userQuery = `select c1.name, c1.release_date,c1.release_month,c1.release_year,c1.duration_min,c1.genre,c1.description,c2.status,c4.location,c5.time from movies c1 
        left join movie_status c2 
        on c1.status = c2.id 
        left join schedules c3 
        on c1.id = c3.movie_id 
        left join locations c4
        on c3.location_id = c4.id
        left join show_times c5
        on c3.time_id = c5.id`
        db.query(userQuery, (err, result) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(result)
        })
    },
    getMovieByStatus: (req, res) => {
        console.log(req.query)
        console.log(req.query.status)
        const userQuery = `select c1.name, c1.release_date,c1.release_month,c1.release_year,c1.duration_min,c1.genre,c1.description,c2.status,c4.location,c5.time from movies c1 
        left join movie_status c2 
        on c1.status = c2.id 
        left join schedules c3 
        on c1.id = c3.movie_id 
        left join locations c4
        on c3.location_id = c4.id
        left join show_times c5
        on c3.time_id = c5.id
        where c2.status = ${db.escape(req.query.status)} 
        or c4.location = ${db.escape(req.query.location)}
        or c5.time = ${db.escape(req.query.time)}
        or c2.status = ${db.escape(req.query.status)} 
        and c4.location = ${db.escape(req.query.location)}
        and c5.time = ${db.escape(req.query.time)} `

        db.query(userQuery, (err, result) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(result)
        })
    },
    registerMovie: async (req, res) => {
        // console.log(req.user)
        const { name, genre, release_date, release_month, release_year, duration_min, description } = req.body

        try {

            const regQuery = `INSERT INTO movies (name, genre, release_date, release_month, release_year, duration_min, description)
                              VALUES (${db.escape(name)} ,${db.escape(genre)}, ${db.escape(release_date)}, ${db.escape(release_month)}, 
                              ${db.escape(release_year)}, ${db.escape(duration_min)}, ${db.escape(description)})`
            const resRegister = await asyncQuery(regQuery)
            console.log(resRegister)


            const userQuery = `SELECT id, name, genre, release_date, release_month, release_year, duration_min, description 
            FROM movies where name = ${db.escape(name)}`
            const result = await asyncQuery(userQuery)
            res.status(200).send(result[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    editStatusMovie: async (req, res) => {
        const {status, token} = req.body
        const id = parseInt(req.params.id)
        console.log(req.user)

        try {
            // query to get data from database
            const getMovie = `select c1.id, c1.name, c1.release_date,c1.release_month,c1.release_year,c1.duration_min,c1.genre,c1.description,c1.status,c2.status,c4.location,c5.time from movies c1 
        left join movie_status c2 
        on c1.status = c2.id 
        left join schedules c3 
        on c1.id = c3.movie_id 
        left join locations c4
        on c3.location_id = c4.id
        left join show_times c5
        on c3.time_id = c5.id
        where c1.status = ${db.escape(req.params.id)}`

            const result = await asyncQuery(getMovie)
            console.log('result dari query', result[0])



            const editStatus = `UPDATE movies SET status = ${db.escape(status)} WHERE id = ${db.escape(req.params.id)}`
            const result2 = await asyncQuery(editStatus)

            const getMovie1 = `select status from movies
        where id = ${db.escape(req.params.id)}`

            const result3 = await asyncQuery(getMovie1)
            console.log('result dari query', result3[0])

            let message = 'status has been changed.'
            result3[0].message = message

            res.status(200).send(result3[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    editScheduleMovie: async (req, res) => {
        const {location_id, time_id} = req.body
        const id = parseInt(req.params.id)
        console.log(req.user)

        try {
            // query to get data from database
            const getMovie = `select c1.id, c1.name, c1.release_date,c1.release_month,c1.release_year,c1.duration_min,c1.genre,c1.description,c1.status,c2.status,c4.location,c5.time from movies c1 
        left join movie_status c2 
        on c1.status = c2.id 
        left join schedules c3 
        on c1.id = c3.movie_id 
        left join locations c4
        on c3.location_id = c4.id
        left join show_times c5
        on c3.time_id = c5.id
        where c1.status = ${db.escape(req.params.id)}`

            const result = await asyncQuery(getMovie)
            console.log('result dari query', result[0])



            const editStatus = `UPDATE schedules SET location_id = ${db.escape(location_id)}, time_id = ${db.escape(time_id)} 
            WHERE id = ${db.escape(req.params.id)}`
            const result2 = await asyncQuery(editStatus)

            const getMovie1 = `select id from movies
        where id = ${db.escape(req.params.id)}`

            const result3 = await asyncQuery(getMovie1)
            console.log('result dari query', result3[0])

            let message = 'schedule has been changed.'
            result3[0].message = message

            res.status(200).send(result3[0])
        }
        catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    }
}