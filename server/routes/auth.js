const _ = require('lodash');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const sendEmail = require('../services/sendgrid')

function ValidateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

/**
 * @description  POST /register
 * @param  {} [checkRegistrationFields]
 * @param  {} request
 * @param  {} response
 * @access public
 */
//[checkRegistrationFields]
router.post('/signup', (req, res) => {
    const isEmailValid = ValidateEmail(req.body.username);

    if(req.body.email && !isEmailValid) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: 'email is not valid'
        });
    }

    if(!(req.body.email || req.body.password)) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: 'Invalid Request body'
        });
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).send({
                statusCode: 400,
                error: 'Email is already taken'
            });
            // if (user.username === req.body.username) {
            //     errors.push({ param: 'username', msg: 'Username is already taken' });
            // }
        } else {

            const newUser = new User({
                email: req.body.email,
                password: req.body.password,
            });

            newUser
                .save()
                .then(async userData => {
                    const min = 10000;
                    const max = 99999;
                    const otp = Math.floor(Math.random() * (max - min + 1)) + min;

                    const secret = jwt.sign({otp : otp, email:  req.body.email}, process.env.JWT_SECRET, {
                        expiresIn: 18000
                    });

                    await sendEmail( req.body.email, {otp :otp})
                    res.status(200).send({
                        status: true,
                        statusCode: 200,
                        secret: secret
                    });
                })
                .catch(err => {
                    res.send({
                        statusCode: 400,
                        err,
                        error: 'Something went wrong, Please check the fields again'
                    });
                });
        }
    });
});


router.post('/verify/otp', async (req, response) => {
    try {

        const { secret , otp } = req.body;
        if (! (secret && otp) ) {
            return response.status(404).send({
                error: 'Invalid body'
            });
        }

        const encoded = jwt.verify(secret, process.env.JWT_SECRET)

        let user = await User.findOne({ email: encoded.email })

        if(!user) {
            return response.status(400).send({ status: false , message: 'Something Went Wrong!'})
        }
        user = _.omit(user.toObject(), ['password']);
        const newObj = JSON.parse(JSON.stringify(user))
        delete newObj.password

        const token = jwt.sign(newObj, process.env.JWT_SECRET, { expiresIn: 18000 });

        if(otp == encoded.otp) {
            return response.status(200).send({ status: true, token: `Bearer ${token}`, user: newObj })
        }

        return response.status(200).send({ status: false , message: 'invalid OTP', statusCode: 400})

    }
    catch ( error ) {
        console.log(error , "error is here")
        return response.status(400).send({ status: false , message: error?.data?.message || error})
    }
});

/**
 * @description POST /login
 * @param  {} checkLoginFields
 * @param  {} request
 * @param  {} response
 * @access public
 */
//checkLoginFields
router.post('/login', async (req, response) => {
    try {

        const user = await User.findOne({ email: req.body.email })
        console.log(user, "user is here")
        console.log(req.body.password, "req body value is here")

        if (!user) {
            return response.status(200).send({
                status: false,
                message: 'No User Found'
            });
        }

        if (req.body.password !== null && !(await user.isValidPassword(req.body.password))) {

            return response.status(200).send({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const newObj = JSON.parse(JSON.stringify(user))
        delete newObj.password

        const token = jwt.sign(newObj, process.env.JWT_SECRET, { expiresIn: 18000 });
    
        return response.status(200).send({ auth: true, token: `Bearer ${token}`, user:newObj })

    }
    catch ( error ) {
        console.log(error , "error is here")
        throw error ;
    }
});

module.exports = router;
