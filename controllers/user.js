const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

mdpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

exports.signup = (req, res, next) =>
{
    if(mdpRegex.test(req.body.password))
    {
        bcrypt.hash(req.body.password, 10)
            .then(hash => 
                {
                    const user = new User
                    ({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                        .then(() => res.status(201).json({ message : 'Utilisateur créé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            .catch(error => res.status(500).json({ error }));
    }
    else
    {
        throw 'Le mot de passe doit contenir huit caractère minimum dont une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial !';
    }
};

exports.login = (req, res, next) =>
{
    User.findOne({ email: req.body.email })
        .then(user =>
            {
                if(!user)
                {
                    return res.status(401).json({ error: 'Utilisateur non trouvé !'});
                }
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => 
                        {
                            if (!valid)
                            {
                                return res.status(401).json({ error: 'Mot de passe incorrect !'});
                            }
                            res.status(200).json
                            ({
                                userId: user._id,
                                token: jwt.sign
                                (
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '24h' }
                                )
                            });
                        })
                    .catch(error => res.status(500).json({ error }));
            })
        .catch(error => res.status(500).json({ error }));
};