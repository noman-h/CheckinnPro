import React from 'react'
import {BrowserRouter,Routes,Route, Router} from 'react-router-dom'
import Header from './Genericcomponents/Header'
import Singup from './Genericcomponents/Singup'
import Login from './Genericcomponents/Login'
import Forgetpass from './Genericcomponents/Forgetpass'
import Resetpass from './Genericcomponents/Resetpass'
import SuperAdminDashboard from './Superadmincomponents/SuperAdminDashboard'
import Hotelform from './Admincomponents/Hoteladdform'
import AdminDashboard from './Admincomponents/AdminDashboard'
import UserDashboard from './Usercomponents/UserDashboard'
import Adminaddform from './Genericcomponents/Adminaddform'
import Hoteldashboard from './Hotelcomponents/Hoteldashboard'
import Protectedroute from './ProtectedRoutes/Protectedroute'
import Roomaddform from './Admincomponents/Roomaddform'
import UserHotelbook from './Usercomponents/UserHotelbook'
import UserRoombook from './Usercomponents/UserRoombook'
import Userbookings from './Usercomponents/Userbookings'
import HotelWindow from './Hotelcomponents/HotelWindow'
import SuperAdminWindow from './Superadmincomponents/SuperAdminWindow'
import AdminWindow from './Admincomponents/AdminWindow'
import Adminprotect from './ProtectedRoutes/Adminprotect'
import Hotelprotect from './ProtectedRoutes/Hotelprotect'
import Superadminprotect from './ProtectedRoutes/Superadminprotect'

function App() {

  return (
    <BrowserRouter>
    
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <Header/>
    <main>
      <Routes>
       <Route path='/' element={<UserDashboard/>}/>
       <Route path='/singup' element={<Singup/>}/>
       <Route path='/forget' element={<Forgetpass/>}/>
       <Route path='/login' element={<Login/>}/>

        <Route path='/Adminaddform' element={<Adminaddform/>}/>

       <Route path='/admindashboard' element={<Adminprotect><AdminWindow/></Adminprotect> }/>

       <Route path='/roomaddform/:roomid?' element={<Protectedroute><Roomaddform/></Protectedroute> }/>

       <Route path='/hoteldashboard' element={<Hotelprotect><HotelWindow/></Hotelprotect>}/>

       <Route path='/superadmindashboard' element={<Superadminprotect><SuperAdminWindow/></Superadminprotect>}/>

       <Route path='/hotelform' element={<Protectedroute><Hotelform/></Protectedroute>}/>

       <Route path='/reset' element={<Protectedroute><Resetpass/></Protectedroute>}/> 

       <Route path='/hotelbook/:hotelEmail' element={<UserHotelbook/>}/> 

       <Route path='/roombook/:roomid' element={<Protectedroute><UserRoombook/></Protectedroute>}/> 

       <Route path='/userbookings' element={<Protectedroute><Userbookings/></Protectedroute>}/> 
       
      </Routes>
    </main>
    </div>
    </BrowserRouter>
  )
}

export default App
