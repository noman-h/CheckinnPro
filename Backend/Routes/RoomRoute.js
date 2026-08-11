const express=require('express')
const router=express.Router()

const Roomcontroller=require('../Controller/RoomController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addroom',auth,authorize('admin','hotel'),Roomcontroller.roomadd)

router.put('/updateroom/:roomid',auth,authorize('admin','hotel'),Roomcontroller.roomupdate)

router.get('/getallrooms',Roomcontroller.roomreadall)

router.get('/getallhotelrooms/:hotelEmail',Roomcontroller.roomreadhotelall)

router.get('/getalladminhotelrooms/:adminemail',auth,authorize('admin'),Roomcontroller.roomreadadminhotelall)

router.get('/getoneroom/:id',Roomcontroller.roomreadone)

router.patch('/softdeleteroom/:id',auth,authorize('hotel','admin'),Roomcontroller.roomsoftdelete)

router.patch('/recoverdeleteroom/:id',auth,authorize('hotel','admin'),Roomcontroller.roomrecoverdelete)

router.delete('/deleteroom/:id',auth,authorize('hotel','admin'),Roomcontroller.roomdelete)

router.post('/bulkimport',auth,authorize('admin'),Roomcontroller.roombulkimport)

module.exports=router