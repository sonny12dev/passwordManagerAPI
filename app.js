const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv/config');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const passport = require('passport');

//Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./verifyToken')(passport);

//Import Routes Middleware
const passwordRoutes = require('./routes/password.route');
const userRoutes = require('./routes/user.route');
const loginRoutes = require('./routes/login.route');

//Routes Middleware
//app.use('/', (req, res) => res.send('on app.js'));
app.use('/user', passwordRoutes);
//app.use('/userCredential', userRoutes); <== I DID NOT USE
app.use('/login', loginRoutes);

//DB
mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    () => console.log('DB Connected')
);

app.listen(port, () => console.log('listening to port ' + port));