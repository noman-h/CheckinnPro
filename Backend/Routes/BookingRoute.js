const express=require('express')
const router=express.Router()

const bookingcontroller=require('../Controller/BookingController')

const auth=require('../Middleware/Auth')
const authrize=require('../Middleware/Authorize')

router.post('/bookinghotel',auth,authrize('user'),bookingcontroller.addbooking)

router.get('/allbooking',auth,authrize('superadmin'),bookingcontroller.allbooking)

router.get('/alladminbooking/:owneremail',auth,authrize('admin'),bookingcontroller.getalladminbookings)

router.get('/hotelbooking/:hotelEmail',auth,authrize('hotel'),bookingcontroller.getallhotelbookings)

router.get('/userbookings/:userId',auth,authrize('user'),bookingcontroller.userbookings)

router.get('/bookingview/:bookid',auth,authrize('admin','hotel','user'),bookingcontroller.bookingview)

router.get('/roombooking/:roomid',auth,authrize('user'),bookingcontroller.roombooking)

router.patch('/bookingcheckin/:bookid',auth,authrize('admin','hotel'),bookingcontroller.bookingcheckin)

router.patch('/bookingcheckout/:bookid',auth,authrize('admin','hotel'),bookingcontroller.bookingcheckout)

router.patch('/bookingcancel/:bookid',auth,authrize('admin','hotel','user'),bookingcontroller.bookingcancel)

module.exports=router