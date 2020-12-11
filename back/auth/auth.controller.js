const authModel = require('./auth.model');

exports.signIn = (req, res, next) => {
    authModel.signIn(req, (err, result) => {
        if (err)
            return res.status(err.status || 500).json(err.data);
        return res.status(200).json(result);
    });
};

exports.signUp = (req, res, next) => {
    authModel.signUp(req, (err, result) => {
        if (err)
            return res.status(err.status || 500).json(err.data);
        return res.status(200).json({message: result});
    });
};

exports.deleteById = (req, res, next) => {
    authModel.deleteById(req, (err, result) => {
        if (err)
            return res.status(err.status || 500).json(err.data);
        return res.status(200).json(result);
    });
};
