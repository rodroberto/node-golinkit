const express = require("express");
const {
    getStats,
    createStat,
    deleteStats,
} = require("../controllers/statController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post('/', createStat)
router.get('/:linkId', validateToken, getStats)
router.delete('/:linkId', validateToken, deleteStats)


module.exports = router;
