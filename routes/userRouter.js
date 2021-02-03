let router = require('express').Router()


// NOTE use body for express validator
let { body } = require('express-validator')

// NOTE import controller yang dibutuhkan
const { userController } = require('../controllers')

// import helpers
const { verifyToken } = require('../helpers/jwt')

let regValidator = [
    body('username')
        .notEmpty()
        .withMessage('Username can\'t be empty')
        .isLength({ min: 6 })
        .withMessage('Username lenght at least 6 character'),
    body('password')
        .notEmpty()
        .withMessage('Password can\'t be empty')
        .isLength({ min: 6 })
        .withMessage('Password lenght at least 6 character')
        .matches(/[0-9]/)
        .withMessage('Password must include a number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must include symbol'),
    body("email")
        .isEmail()
        .withMessage("Email format is not correct")


]

// edit password validation
const editPassValidation = [
    body('password')
        .notEmpty()
        .withMessage('Password can\'t empty')
        .isLength({ min: 6 })
        .withMessage('Password must have 6 character')
        .matches(/[0-9]/)
        .withMessage('Password must include number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must include symbol')
]


// NOTE create router
router.get('/getUser', userController.getAllUser)
router.post('/login', userController.login)
router.post('/register', regValidator , userController.register) // NOTE bisa pake put juga
router.post('/edit/:index', userController.edit) // NOTE bisa pake patch juga
router.post('/edit_password/:id', editPassValidation, userController.editPass)
router.delete('/delete/:index', userController.delete)
router.post('/keepLogin', verifyToken, userController.keepLogin)
router.patch('/deactive', verifyToken, userController.deactiveAcc)
router.patch('/activate', verifyToken, userController.activateAcc)
router.patch('/close', verifyToken, userController.closeAcc)

// NOTE export router
module.exports = router