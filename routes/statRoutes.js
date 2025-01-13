const express = require("express");
const {
    getStats,
    createStat,
    deleteStats,
    getAllStats,
} = require("../controllers/statController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post('/', createStat)
router.get('/all', validateToken, getAllStats)
router.get('/:linkId', validateToken, getStats)
router.delete('/:linkId', validateToken, deleteStats)


module.exports = router;
