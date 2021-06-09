const express = require('express');
//const PasswordModel = require('../models/password.model');
const UserModel = require('../models/user.model');
const router = express.Router();
const bcrypt = require('bcryptjs');
//const { required } = require('@hapi/joi'); <-- NO NEED FOR THIS
const { registerValidation, logValidation } = require('../validation');
const passport = require('passport');

//CREATE - add new user or registration form
router.post('/addUser', async (req, res) => {

     //Validation
     const {error} = await  registerValidation(req.body);

     //Check if there is error
    if(error){
     const usernameError = error.details[0].context.regex;
     if(usernameError){ //Check if there is regex which means no space
         res.json({ success: false, message: 'username should be no space.' });
     }else{
         res.json({ success: false, message: error.details[0].message });
     }
    }else{
        //Try saving the validated data to db
        try{

            const userExist = await UserModel.findOne({
                username: req.body.username
            });
            if(userExist) return res.json({ success: false, message: 'Username already exist' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            const newUser = new UserModel({
                username: req.body.username,
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            res.json({ success: true, message: savedUser });
        }catch(err){
            res.json({ message: err });
        }

    }
     
});

//CREATE - Add log password credential to a nested doc
router.post('/addPassword/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const {error} = await logValidation(req.body);

    //Check if there is error
   if(error){
    //Check error for username and email if there is no space
    const ifError = error.details[0].context;
    if(ifError.regex){
            if(ifError.key == 'username' || ifError.key == 'email')
        res.json({ success: false, message: ifError.key + ' should be no space.' });
    }else{
        res.json({ success: false, message: error.details[0].message });
    }
   }else{
        //Try saving validated data to db
        try{

            const newPass = {
                title: req.body.title,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            }

            const searchedUser = await UserModel.findById(req.params.userId);

            searchedUser.log.push(newPass);
            searchedUser.save();

            res.json({ success: true, savedData: searchedUser });

        }catch(err){
            res.json({ success: false, message: err + ' whoo' });
        }

    }

});

//EDIT - edit many fields
router.patch('/editPassword/:userId/:logId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const userId = req.params.userId;
        const logId = req.params.logId;

        //To search specific user in db
        //const searchedUser = await UserModel.findById(req.params.userId);

        //To search specific nested doc or children
        //const searchedLogId = await searchedUser.log.id(req.params.logId);

        //This is how you update a nested object array in db
        //Note: it is very important to have positional operator $ in your $set
        const updatedLog = await UserModel.updateMany({
            'log._id': logId
        },
        { $set: 
            { 
                'log.$.title': req.body.title,
                'log.$.username': req.body.username,
                'log.$.email': req.body.email,
                'log.$.password': req.body.password
            }
        });

        res.status(200).json({success: true, data: updatedLog});

    }catch(err){
        res.json({ success: false, error: err });
    }
});

//DELETE - delete the user (I will not use this. So you can skip this or this can be only a reference for future)
router.delete('/deleteUser/:userId', async (req, res) => {
    try{
        const deletePassword = await UserModel.deleteOne({ _id: req.params.userId });

        res.json(deletePassword);
    }catch(err){
        res.json(err);
    }
});

//DELETE - delete a specific log in a nested object array
router.delete('/deleteLog/:userId/:logId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const userId = req.params.userId;
        const logId = req.params.logId;

        //Step 1 - search the user
        const searchLog = await UserModel.findById(userId);

        //Step 2 - use these 2 method (remove or pull)
        //const searchedLog = await searchLog.log.id(logId).remove();
        const searchedLog = await searchLog.log.pull(logId);
        //You must include the save() in order for the remove to work
        searchLog.save();
        res.status(200).json({ 
            success: true,
            data: searchLog
        });
        //res.json(searchedLog);
    }catch(err){
        res.json(err);
    }
});

//READ - display all the list data
//I did not use this because this will display all user list and we dont want that. This is for reference purpose only
router.get('/list', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const list = await UserModel.find();
        res.json(list);
    }catch(err){
        res.json(err);
    }

});

//READ - display all the user log list data
router.get('/listPassword/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const listPassword = await UserModel.findById(req.params.userId);
        res.json(listPassword.log);
    }catch(err){
        res.json(err);
    }

});

module.exports = router;