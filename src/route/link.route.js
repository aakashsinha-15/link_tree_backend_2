import { Router } from "express";
import { addLinksAndShop, editLinkAndShop, deleteLinkAndShop, countClicksOnLinksAndPost, getUserAnalytics, getLinksAndShop } from "../controller/links.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/add-link').post(verifyjwt, addLinksAndShop)
router.route('/edit-link/:id').patch(verifyjwt, editLinkAndShop)
router.route('/delete-link/:id').delete(verifyjwt, deleteLinkAndShop)
router.route('/get-links').get(verifyjwt, getLinksAndShop)
// router.route('/count-clicks/:id').get(verifyjwt, countClicksOnLinksAndPost)

router.route('/count-clicks/:id').post(verifyjwt, countClicksOnLinksAndPost);
router.route('/analytics').get(verifyjwt, getUserAnalytics);


export default router;