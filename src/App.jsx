import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Index from '../screens/Index'
import Success from '../screens/SuccessCard'
import AdminDashboard from '../screens/AdminDashboard'
import AdminLogin from '../screens/AdminLogin'
import FormData from '../screens/FormData'
import SuperAdminDashboard from '../screens/SuperAdminDashboard'
import SuperAdminLogin from '../screens/SuperAdminLogin'


function App() {
  return (
   <Routes>
    <Route path='/' element={<Index/>} />
    <Route path='/admin/dashboard' element={<AdminDashboard/>} />
    <Route path='/admin/login' element={<AdminLogin/>} />
    <Route path='/status' element={<Success/>} />
    <Route path='/admin/form-data' element={<FormData/>} />
    <Route path='/super/admin/dashboard' element={<SuperAdminDashboard/>} />
    <Route path='/super/admin/login' element={<SuperAdminLogin/>} />
   </Routes>
  )
}

export default App
