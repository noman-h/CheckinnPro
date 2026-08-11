const express=require('express')
const router=express.Router()

const Coupancontroller=require('../Controller/CoupanController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addcoupan',auth,authorize('admin'),Coupancontroller.coupanadd)

router.patch('/updatecoupan',auth,authorize('admin'),Coupancontroller.coupanupdate)

router.get('/getallcoupans/:roomid',Coupancontroller.coupanreadall)

router.get('/getallhotelcoupans/:hotelemail',auth,authorize('hotel'),Coupancontroller.coupanreadallhotel)

router.get('/getalladminhotelcoupans/:owneremail',auth,authorize('admin'),Coupancontroller.coupanreadalladmin)

router.get('/getonecoupan/:id',auth,authorize('admin'),Coupancontroller.coupanreadone)

router.patch('/softdeletecoupan/:id',auth,authorize('admin'),Coupancontroller.coupansoftdelete)

router.patch('/recoverdeletecoupan/:id',auth,authorize('admin'),Coupancontroller.coupanrecoverdelete)

router.delete('/deletecoupan/:id',auth,authorize('admin'),Coupancontroller.coupandelete)

router.post('/bulkimport',auth,authorize('admin'),Coupancontroller.coupanbulkimport)

module.exports=router