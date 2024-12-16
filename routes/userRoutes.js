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
  resetUserPassword
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profiles/:profileLink", publicUser);
router.get("/current", validateToken, currentUser);
router.put("/update-password", validateToken, updateUserPassword);
router.put("/onboarding", validateToken, profileOnboarding);
router.put("/profile-link", validateToken, updateProfileLink);
router.post("/send-verification-code", sendVerificationCode);
router.post("/verify", verifyCode);
router.post("/reset-password", resetUserPassword);

module.exports = router;
