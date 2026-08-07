const express=require('express')
const router=express.Router()

const reviewcontroller=require('../Controller/ReviewController')

router.post('/addreview',reviewcontroller.addreview)
router.get('/hotelreviews/:hotelEmail',reviewcontroller.hotelreviews)
router.get('/adminhotelreviews/:owneremail',reviewcontroller.adminhotelreviews)

module.exports=router