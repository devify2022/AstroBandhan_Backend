import express from 'express';
import { astrologerLogin, changePassword, forgetPassword, updatePassword, validateOtp } from '../../controller/astrologer/astrologerAuthController.js';
import { editProfilePhoto } from '../../controller/admin/editAstrologerProfilePhoto.js';
import { upload } from '../../middlewares/multer.middlewre.js';
import { addPendingAstrologerRequest } from '../../controller/astrologer/createPendingRequest.js';


const router = express.Router();


router.post('/login', astrologerLogin);
router.post('/changePassword/:astrologerId', changePassword);
router.put('/editprofilephoto/:astrologerId', upload.single('avatar'), editProfilePhoto)
router.post('/create/pendingastrologer', addPendingAstrologerRequest)
router.post('/send/otp', forgetPassword)
router.post('/validate/otp', validateOtp)
router.post('/update/password', updatePassword)


export default router;
