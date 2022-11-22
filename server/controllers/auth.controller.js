const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// Create a new user in database
exports.signup = (req, res) => {
    if(req.body.email.length > 25 || req.body.fname.length > 25|| req.body.lname.length > 25 || req.body.password.length > 25){
        res.status(400).send({ message: "Invalid form input: Too long" });
        return;
    }
    if(req.body.fname.length < 3 || req.body.lname.length < 3 || req.body.password.length < 8){
        res.status(400).send({ message: "Invalid form input: Too short" });
        return;
    }
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        balance: 0,
        cash: 0,
        portfolio: [],
        portfolioValue: 0,
        password: bcrypt.hashSync(req.body.password, 8),
    });
    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    user.roles = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.status(200).send({ message: "Successfully registered!" });
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        console.log(err)
                        res.status(500).send({ message: err });
                        return;
                    }
                    res.status(200).send({ message: "Successfully registered!" });
                });
            });
        }
    });
};

// Sign in user by checking database, sign jwt token if successful
exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (!user) {
                return res.status(404).send({ message: "Account not found" });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Incorrect Password"
                });
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            var authorities = [];
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user._id,
                roles: authorities,
                accessToken: token
            });
        });
};