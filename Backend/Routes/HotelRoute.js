const express=require('express')
const router=express.Router()

const hotelcontroller=require('../Controller/HotelController')

router.post('/addhotel',hotelcontroller.hotladd)
router.post('/addhoteldirect',hotelcontroller.directhoteladd)
router.post('/updatehotel',hotelcontroller.hotelupdate)
router.get('/getallhotels',hotelcontroller.hotelreadall)
router.get('/getalladminhotels/:adminemail',hotelcontroller.hotelreadadminall)
router.get('/getalladminhotelsopt/:adminemail',hotelcontroller.hotelreadadminopt)
router.get('/getonehotel/:id',hotelcontroller.hotelreadone)
router.get('/getcheckone/:id',hotelcontroller.hotelcheckone)
router.patch('/softdeletehotel/:id',hotelcontroller.hotelsoftdelete)
router.patch('/recoverdeletehotel/:id',hotelcontroller.hotelrecoverdelete)
router.delete('/deletehotel/:id',hotelcontroller.hoteldelete)
router.patch('/approvehotel',hotelcontroller.hotelapprove)
router.patch('/rejecthotel',hotelcontroller.hotelreject)
router.post('/hotelemailotpsend',hotelcontroller.emailotpsend)
router.patch('/hotelotpsend',hotelcontroller.updateotpsend)
router.patch('/hotelotpverify',hotelcontroller.updateotpverify)

module.exports=router