import { Router } from 'express'
import { editProfile, forgetPasswordRecoveryByEmail, loginUser, logoutUser, registerUser, resetPassword, getUserDetailsById } from '../controller/user.controller.js';
import { verifyjwt } from '../middlewares/auth.middleware.js';

const router = Router()

router.route('/login').post(loginUser)
router.route('/register').post(registerUser)
router.route('/logout').post(verifyjwt, logoutUser)
router.route('/forget-password').post(forgetPasswordRecoveryByEmail)
router.route('/reset-password').post(resetPassword)
router.route('/edit-profile').patch(verifyjwt, editProfile)
router.route('/user-details').get(verifyjwt, getUserDetailsById)

export default router;