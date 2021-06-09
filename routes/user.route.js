//NOTE: I DID NOT USE THIS BUT I DID NOT ERASE/DELETE/REMOVE FOR REFERENCE PURPORSES

const router = require('express').Router();
const UserModel = require('../models/user.model');

//router.use('/userfield', (req, res) => res.send('you are in user'));

//CREATE - add new user with nested document
router.post('/register', async (req, res) => {

    const newUser = new UserModel ({
        username: req.body.username,
        password: req.body.password
    });

    try{
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    }catch(err){
        res.status(400).json(err);
    }
});

module.exports = router;