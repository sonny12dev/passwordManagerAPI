const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv/config');
const UserModel = require('./models/user.model');

module.exports = function(passport) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
    //opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('JWT'); <---THIS WONT WORK
    opts.secretOrKey = process.env.TOKEN_SECRET;
    //opts.issuer = 'accounts.examplesoft.com';
    //opts.audience = 'yoursite.net';

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

        UserModel.findOne({ _id: jwt_payload._id }, function(err, data) {
            if (err) {
                return done(err, false);
            }
            if (data) {
                return done(null,data);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });

    }));

}