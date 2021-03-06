const express = require('express');
const router = express.Router();
const ratesController = require('./rates.controller');

router.get('/currency-pairs', ratesController.getCurrencyPairs);
router.get('/currencies', ratesController.getCurrencies);
router.get('/details/:currency', ratesController.getCurrencyDetails);
router.get('/date-details/:currency/:date', ratesController.getCurrencyDetailsByDate);
router.get('/current-nbu-rate', ratesController.getCurrentNBURate);
router.get('/forecast-base/:currency', ratesController.getNBURate);
router.get('/convert', ratesController.convert);
router.get('/forecast', ratesController.forecastRate);
router.get('/:date', ratesController.getRateByDate);

module.exports = router;