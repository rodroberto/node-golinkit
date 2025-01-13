const express = require("express");
const {
  getLinks,
  getPublicLinks,
  createLink,
  updateLink,
  deleteLink,
  getAllLinks,
} = require("../controllers/linkController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();


router.get('/all', validateToken, getAllLinks);
router.get('/', validateToken, getLinks);
router.get('/:profileLink', getPublicLinks);

router.post('/', validateToken, createLink);
router.put('/:id', validateToken, updateLink);
router.delete('/:id', validateToken, updateLink);

module.exports = router;
