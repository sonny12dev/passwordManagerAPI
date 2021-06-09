const express = require('express');
const router = express.Router();
const UserModel = require('../models/user.model');
const { registerValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    //Validation of username and password
    const {error} = registerValidation(req.body);
    if(error)
        //Check if there is regex which means no space
        if(error.details[0].context.regex)
        
            res.json({ success: false, message: 'username should be no space.'} );
        
        else

            res.json({ success: false, message: error.details[0].message });
        
    //If no error meaning it properly inputed correctly
    if (typeof error == 'undefined'){
    //NOTE: Encouter an error if no curly braces in if statement. Maybe because of the declaration const but I think it will work without the curly braces if only direct or one liner code like return. See above sample it worked when the code are one liner
    const user = await UserModel.findOne({ username: req.body.username });
    if(!user) return res.json({ success: false, message: 'Username doesn\'t exist' });
    
    //Compare password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).json({ success: false, message: 'Invalid password.' });

    //Assign JWT
    const token = jwt.sign(
        { _id: user._id }, 
        process.env.TOKEN_SECRET,
        { 
            expiresIn: 604800 //1week
        });

    res.status(200).json({ 
        success: true,
        id: user._id,
        username: user.username, 
        token: 'JWT ' + token
    });

    }
});

module.exports = router;