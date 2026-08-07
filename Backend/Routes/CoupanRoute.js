const express=require('express')
const router=express.Router()

const Coupancontroller=require('../Controller/CoupanController')

router.post('/addcoupan',Coupancontroller.coupanadd)
router.patch('/updatecoupan',Coupancontroller.coupanupdate)
router.get('/getallcoupans/:roomid',Coupancontroller.coupanreadall)
router.get('/getallhotelcoupans/:hotelemail',Coupancontroller.coupanreadallhotel)
router.get('/getalladminhotelcoupans/:owneremail',Coupancontroller.coupanreadalladmin)
router.get('/getonecoupan/:id',Coupancontroller.coupanreadone)
router.patch('/softdeletecoupan/:id',Coupancontroller.coupansoftdelete)
router.patch('/recoverdeletecoupan/:id',Coupancontroller.coupanrecoverdelete)
router.delete('/deletecoupan/:id',Coupancontroller.coupandelete)

module.exports=router