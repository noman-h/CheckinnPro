const express=require('express')
const router=express.Router()

const bookingcontroller=require('../Controller/BookingController')

router.post('/bookinghotel',bookingcontroller.addbooking)
router.get('/allbooking',bookingcontroller.allbooking)
router.get('/alladminbooking/:owneremail',bookingcontroller.getalladminbookings)
router.get('/hotelbooking/:hotelEmail',bookingcontroller.getallhotelbookings)
router.get('/userbookings/:userId',bookingcontroller.userbookings)
router.get('/bookingview/:bookid',bookingcontroller.bookingview)
router.get('/roombooking/:roomid',bookingcontroller.roombooking)
router.patch('/bookingcheckin/:bookid',bookingcontroller.bookingcheckin)
router.patch('/bookingcheckout/:bookid',bookingcontroller.bookingcheckout)
router.patch('/bookingcancel/:bookid',bookingcontroller.bookingcancel)


module.exports=router