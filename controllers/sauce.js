const Sauces = require('../models/Sauces');
const fs = require('fs');
const { db } = require('../models/Sauces');
const formValidation = require('../middleware/form');

const regex = /^[A-Za-z0-9-,.?:;!çéèà()&\s]+$/;

exports.createSauce = (req, res, next) =>
{
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    if(regex.test(sauceObject.name) && regex.test(sauceObject.manufacturer) && regex.test(sauceObject.description) && regex.test(sauceObject.mainPepper))
    {
        const sauce = new Sauces
        ({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        });
        sauce.save()
            .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
            .catch(error => res.status(400).json({ error }));
    }
    else
    {
        throw 'Caractères non autorisés détéctés !';
    }
};

exports.modifySauce = (req, res, next) => 
{
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    if(regex.test(sauceObject.name) && regex.test(sauceObject.manufacturer) && regex.test(sauceObject.description) && regex.test(sauceObject.mainPepper))
    {
        Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !'}))
          .catch(error => res.status(400).json({ error }));
    }
    else
    {
      throw 'Caractères non autorisés détéctés !';
    }
  };

  exports.deleteSauce = (req, res, next) => 
  {
    Sauces.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauces.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

exports.getOneSauce = (req, res, next) =>
{
    Sauces.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(() => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) =>
{
    Sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.postLike = (req, res, next) =>
{
    let like = req.body.like;
    let property = {};
    let userId = req.body.userId;
    switch(like)
    {
        case -1:
          console.log('case -1');
            property =
            {
                $push: { usersDisliked: userId },
                $inc: { dislikes: 1 }
            };
            Sauces.updateOne({ _id: req.params.id }, property)
              .then(() => res.status(200).json({ message: "Objet Disliké!" }))      
              .catch(error => res.status(400).json({ error }));
            break;

        case 1:
            property = 
            {
              $push: { usersLiked: userId },
              $inc: { likes: 1}
            };
            Sauces.updateOne({ _id: req.params.id }, property)
              .then(() => res.status(200).json({ message: "Objet Liké!" }))      
              .catch(error => res.status(400).json({ error }));
            break;

        case 0:
            Sauces.findOne({ _id: req.params.id })
              .then(sauce => 
              {
                  res.status(200).json(sauce)
                  let isLiked = sauce.usersLiked;
                  let userLiked = isLiked.indexOf(userId);
                  if(userLiked === -1)
                  {
                    property =
                    {
                        $pull: { usersDisliked: userId },
                        $inc: { dislikes: -1 }
                    };
                  }
                  else
                  {
                    property =
                    {
                        $pull: { usersLiked: userId },
                        $inc: { likes: -1 }
                    }
                  }   
                  Sauces.updateOne({ _id: req.params.id }, property)
                      .then(() => res.status(201).json({ message: "Plus aucun like !" }))      
                      .catch(error => res.status(401).json({ error }));             
              })
              .catch(error => res.status(500).json({ error }));              
              break;
    }
};