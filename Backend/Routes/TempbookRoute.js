const express=require('express')
const router=express.Router()

const Tempcontroller=require('../Controller/TempbookingController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/tempbookings',auth,authorize('user'),Tempcontroller.tempbooking)

router.get('/getalltempbooking',auth,authorize('user'),Tempcontroller.gettempbooking)


module.exports=router