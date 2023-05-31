const express = require('express');
const router = express.Router();
const { User } = require('../models/User')
const mongoose = require('mongoose');
const _ = require('lodash');

/**
 * @description POST /api/User/
 */
router.post('/profile', async( req, res) => {
    try {

        if(!req.user) {
            return res.status(400).send({statusCode: 400, message: 'something went wrong!', success: false}) ;
        }
        const body = req.body;
        if(!(body.name || body.age)) {
            return res.status(400).send({statusCode: 400, message: 'invalid request body', success: false}) ;
        }

        const _ = await User.updateOne({_id: mongoose.Types.ObjectId(req.user._id)}, body)

        return res.status(200).send({statusCode: 200, message: 'profile updated Successfully', success: true}) ;

    }
    catch ( error ) {
        console.log(error, "error is here")
        return res.status(400).send({message: 'something went wrong!' , success: false}) ;
    }
})

/**
 * @description GET /api/User/
 */

router.get('/profile', async( req, res) => {
    try {

        if(!req.user) {
            return res.status(400).send({statusCode: 400, message: 'something went wrong!', success: false}) ;
        }

        const result = await User.findOne({_id: mongoose.Types.ObjectId(req.user._id)})

        user = _.omit(result.toObject(), ['password']);
        const newObj = JSON.parse(JSON.stringify(user))
        delete newObj.password

        return res.status(200).send({statusCode: 200, success: true , data: newObj}) ;

    }
    catch ( error ) {
        return res.status(400).send({message: 'something went wrong!' , success: false}) ;
    }
})


module.exports = router;