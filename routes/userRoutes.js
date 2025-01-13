const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  updateUserPassword,
  profileOnboarding,
  updateProfileLink,
  publicUser,
  sendVerificationCode,
  verifyCode,
  resetUserPassword,
  updateBio,
  updateProfileImage,
  updateBackgroundImage,
  getUsers,
  searchUser,
  deleteUser,
  updateVerified
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profiles/:profileLink", publicUser);
router.get("/current", validateToken, currentUser);
router.put("/update-password", validateToken, updateUserPassword);
router.put("/update-bio", validateToken, updateBio);
router.put("/update-profile-image", validateToken, updateProfileImage);
router.put("/update-background-image", validateToken, updateBackgroundImage);
router.put("/onboarding", validateToken, profileOnboarding);
router.put("/profile-link", validateToken, updateProfileLink);
router.post("/send-verification-code", sendVerificationCode);
router.post("/verify", verifyCode);
router.post("/reset-password", resetUserPassword);
router.get("/", validateToken, getUsers);
router.get("/search/:username", validateToken, searchUser);
router.delete('/:id', validateToken, deleteUser)
router.put('/update-verified', validateToken, updateVerified)

module.exports = router;
