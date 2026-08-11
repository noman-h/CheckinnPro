const express=require('express')
const router=express.Router()

const reviewcontroller=require('../Controller/ReviewController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addreview',auth,authorize('user'),reviewcontroller.addreview)
router.get('/hotelreviews/:hotelEmail',auth,authorize('hotel'),reviewcontroller.hotelreviews)
router.get('/adminhotelreviews/:owneremail',auth,authorize('admin'),reviewcontroller.adminhotelreviews)

module.exports=router