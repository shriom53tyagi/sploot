const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        if (!token) {
            return res.status(401).send("No Token found");
        } else {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.json({ auth: false, message: "Invalid Auth Token"});
                } else {

                    req.user = decoded;
                    next();
                }
            });
        }
    }
    catch (error) {
        console.log(error , 'error value is here')
    }

};

module.exports = { verifyJWT }