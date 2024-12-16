const express = require("express");
const {
    getLinks,
    getPublicLinks,
    createLink,
    updateLink,
    deleteLink,
} = require("../controllers/linkController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.get('/:profileLink', getPublicLinks)
router.use(validateToken)
router.route("/").get(getLinks).post(createLink);
router.route("/:id").put(updateLink).delete(deleteLink);


module.exports = router;
