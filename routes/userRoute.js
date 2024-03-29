const express = require("express");
const { registerUser, loginUser, logout, forgotPassword, resendOtp, resetPassword, getUserDetails, getUser, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser, signInWithGoogle, accountVerificationOTP, passwordResetOtp, AddUser, } = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { otpLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/fileUpload");

const router = express.Router();

// router.route("/sendOTP").post(otpLimiter, sendOTP);

router.route("/verifyRegistration").post(accountVerificationOTP);

router.route("/googleAuth").post(signInWithGoogle);
router.route("/resendOtp").post(resendOtp);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/verify-otp").post(passwordResetOtp);

router.route("/password/reset/").post(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
    .route("/admin/addUser")
    .post(isAuthenticatedUser, authorizeRoles("admin"), AddUser);

router
    .route("/user/user/:id")
    .get(isAuthenticatedUser, isAuthenticatedUser, getUser);
router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
module.exports = router;
