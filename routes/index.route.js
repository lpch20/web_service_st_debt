const express = require('express');
const router = express.Router();
const  verifyToken  = require('../middlewares/authToken');
const { generateNonExpiringToken } = require('../services/tokenGenerator.service');
const { getCiFromTeledata, getDebt } = require('../controllers/index.controller');

router.get('/authentication', generateNonExpiringToken)
router.get('/getCi/:ci', verifyToken ,getCiFromTeledata);
router.get('/getDebt/:ci', verifyToken ,getDebt);

module.exports = router;
