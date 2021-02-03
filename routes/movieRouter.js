const connection = require("../database");

let router = require('express').Router()

// NOTE use body for express validator
let { body } = require('express-validator')

// import helpers
const { verifyToken } = require('../helpers/jwt')

let regValidator = [
    body('product_name')
        .notEmpty()
        .withMessage('Product name can\'t be empty')
        .isLength({ min: 3 })
        .withMessage('Product name lenght at least 3 character'),
    body('price')
        .notEmpty()
        .withMessage('Price can\'t be empty')
        .isNumeric()
        .withMessage('Price can\'t be other than number')
]


let { movieController } = require('../controllers')

// NOTE create router
router.get('/get/all', movieController.getAllMovie)
router.get('/get', movieController.getMovieByStatus)
router.post('/add', movieController.registerMovie)
router.patch('/edit/:id', verifyToken ,movieController.editStatusMovie)
router.patch('/set/:id', verifyToken ,movieController.editScheduleMovie)

// NOTE export router
module.exports = router