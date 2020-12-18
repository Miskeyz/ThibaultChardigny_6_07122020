const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const maskEmail = require('mongo-project');

mdpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

exports.signup = (req, res, next) =>
{
    if(mdpRegex.test(req.body.password) && emailRegex.test(req.body.email))
    {
        const email = req.body.email;
        const emailBuffer = Buffer.from(email);
        const emailMasked = emailBuffer.toString('base64');
        bcrypt.hash(req.body.password, 10)
            .then(hash => 
                {
                    const user = new User
                    ({
                        email: emailMasked,
                        password: hash
                    })
                    user.save()
                        .then(() => res.status(201).json({ message : 'Utilisateur créé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            .catch(error => res.status(500).json({ error }));
    }
    else
    {
        throw 'Format de données non valide !';
    }
};

exports.login = (req, res, next) =>
{
    if(mdpRegex.test(req.body.password) && emailRegex.test(req.body.email))
    {
        const email = req.body.email;
        const emailBuffer = Buffer.from(email);
        const emailMasked = emailBuffer.toString('base64');
        User.findOne({ email: emailMasked })
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
    }
    else
    {
        throw 'Données saisies non valides !'
    }
};