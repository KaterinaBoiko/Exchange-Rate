const express = require('express');
const router = express.Router();
const ratesController = require('./rates.controller');

router.get('/rate/:date', ratesController.getRateByDate);
router.get('/currency-pairs', ratesController.getCurrencyPairs);
router.get('/details/:currency', ratesController.getCurrencyDetails);
router.get('/current-nbu-rate', ratesController.getCurrentNBURate);
router.get('/convert', ratesController.convert);

module.exports = router;