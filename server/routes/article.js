const express = require('express');
const { User }  = require('../models/User');
const router = express.Router();
const { Article } = require('../models/article');

const mongoose = require('mongoose');

/**
 * @description POST /api/article/
 */
 router.post('/', async ( req, res) => {
    try {

        if(!req.user) {
            return res.status(400).send({statusCode: 400, message: 'something went wrong!' , success: false}) ;
        }

        const body = req.body;
        body.user_id = req.user._id

        const newArticle = new Article(body)

        newArticle.save()
        .then(response => {
            return res.status(400).send({statusCode: 200, message: 'Article Updated Successfully' , success: true}) ;
        })
        .catch(err => {
            console.log(err , "error is here")
            return res.status(400).send({statusCode: 400, message: 'something went wrong!' , success: false}) ;
        })

    }
    catch ( error ) {

        return res.status(400).send({message: 'something went wrong!' , success: false}) ;
    }
})

/**
 * @description GET /api/article/:id Fetch particular Article
 */
router.get('/:id', async ( req, res) => {
    try {

        const id = req.params.id
        const result = await Article.find({ _id: mongoose.Types.ObjectId(id)});

        return res.status(200).send({
            success: true,
            statusCode: 200,
            data: result
        }) ;
    }
    catch ( error ) {
        return res.status(400).send({message: 'something went wrong!' , success: false,  statusCode: 400}) ;
    }
})

/**
 * @description GET /api/article Get all List of artilce of specific User
 */
router.get('/', async ( req, res) => {
    try {

        const limit = req.params.limit || 10
        if(!req.user) {
            return res.status(400).send({statusCode: 400, message: 'something went wrong!', success: false}) ;
        }

        //user_id: req.user._id use this inside find if we need to find user specific

        let result = await Article.find({}).sort({_id: -1}).limit(limit);
        
        const result_final = [];
        for (const item of result) {
            const userDetails = await User.find({ _id: mongoose.Types.ObjectId(item.user_id)})
            item.created_by = userDetails[0].name;
            const newItem = Object.assign({}, item._doc, {created_by: userDetails[0].name} );
            result_final.push(newItem);
        }

        return res.status(200).send({
            success: true,
            statusCode: 200,
            data: result_final
        });

    }
    catch ( error ) {
        console.log(error, 'error is here')
        return res.status(400).send({message: 'something went wrong!' , statusCode: 400}) ;
    }
})


module.exports = router;