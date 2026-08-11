const express=require('express')
const router=express.Router()

const statecontroller=require("../Controller/StateController")
const districtcontroller=require("../Controller/DistrictController")
const citycontroller=require("../Controller/CityController")

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addstate',auth,authorize('superadmin'),statecontroller.stateadd)
router.patch('/updatestate',auth,authorize('superadmin'),statecontroller.stateupdate)
router.get('/getallstate',auth,authorize('superadmin'),statecontroller.statereadall)
router.get('/getonestate/:id',auth,authorize('superadmin'),statecontroller.statereadone)
router.patch('/softdeletestate/:id',auth,authorize('superadmin'),statecontroller.statesoftdelete)
router.patch('/recoverdeletestate/:id',auth,authorize('superadmin'),statecontroller.staterecoverdelete)
router.delete('/deletestate/:id',auth,authorize('superadmin'),statecontroller.statedelete)

router.post('/adddistrict',auth,authorize('superadmin'),districtcontroller.districtadd)
router.patch('/updatedistrict',auth,authorize('superadmin'),districtcontroller.districtupdate)
router.get('/getalldistrict',auth,authorize('superadmin'),districtcontroller.districtreadall)
router.get('/getonedistrict/:id',auth,authorize('superadmin'),districtcontroller.districtreadone)
router.patch('/softdeletedistrict/:id',auth,authorize('superadmin'),districtcontroller.districtsoftdelete)
router.patch('/recoverdeletedistrict/:id',auth,authorize('superadmin'),districtcontroller.districtrecoverdelete)
router.delete('/deletedistrict/:id',auth,authorize('superadmin'),districtcontroller.districtdelete)

router.post('/addcity',auth,authorize('superadmin'),citycontroller.cityadd)
router.patch('/updatecity',auth,authorize('superadmin'),citycontroller.cityupdate)
router.get('/getallcity',citycontroller.cityreadall)
router.get('/getonecity/:id',auth,authorize('superadmin'),citycontroller.cityreadone)
router.patch('/softdeletecity/:id',auth,authorize('superadmin'),citycontroller.citysoftdelete)
router.patch('/recoverdeletecity/:id',auth,authorize('superadmin'),citycontroller.cityrecoverdelete)
router.delete('/deletecity/:id',auth,authorize('superadmin'),citycontroller.citydelete)


module.exports=router