
const regex = /[A-Za-z0-9-]+/;

module.exports = (req, res, next) => 
{
    try
    {
        if(regex.test(sauceObject.name) && regex.test(sauceObject.manufacturer) && regex.test(sauceObject.description) && regex.test(sauceObject.mainPepper))
        {
            next();
            console.log('Test OK');
        }
        else
        {
            throw 'Caractères non autorisés détéctés !';
        }  
    }

    catch
    {
        res.status(401).json({ error });
    }
};