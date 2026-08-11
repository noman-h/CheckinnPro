const express=require('express')
const router=express.Router()

const hotelcontroller=require('../Controller/HotelController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addhotel',auth,authorize('admin'),hotelcontroller.hotladd)

router.post('/addhoteldirect',auth,authorize('superadmin'),hotelcontroller.directhoteladd)

router.post('/updatehotel',auth,authorize('admin','superadmin'),hotelcontroller.hotelupdate)

router.get('/getallhotels',hotelcontroller.hotelreadall)

router.get('/getalladminhotels/:adminemail',auth,authorize('admin'),hotelcontroller.hotelreadadminall)

router.get('/getalladminhotelsopt/:adminemail',auth,authorize('admin'),hotelcontroller.hotelreadadminopt)

router.get('/getonehotel/:id',hotelcontroller.hotelreadone)

router.get('/getcheckone/:id',auth,authorize('admin'),hotelcontroller.hotelcheckone)

router.patch('/softdeletehotel/:id',auth,authorize('admin','superadmin'),hotelcontroller.hotelsoftdelete)

router.patch('/recoverdeletehotel/:id',auth,authorize('admin','superadmin'),hotelcontroller.hotelrecoverdelete)

router.delete('/deletehotel/:id',auth,authorize('admin','superadmin'),hotelcontroller.hoteldelete)

router.patch('/approvehotel',auth,authorize('superadmin'),hotelcontroller.hotelapprove)

router.patch('/rejecthotel',auth,authorize('superadmin'),hotelcontroller.hotelreject)

router.post('/hotelemailotpsend',auth,authorize('admin'),hotelcontroller.emailotpsend)

router.patch('/hotelotpsend',auth,authorize('admin'),hotelcontroller.updateotpsend)

router.patch('/hotelotpverify',auth,authorize('admin'),hotelcontroller.updateotpverify)

router.post('/bulkimport',auth,authorize('admin'),hotelcontroller.hotelbulkimport)

module.exports=router