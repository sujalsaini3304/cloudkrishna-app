import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Index from '../screens/Index'
import Success from '../screens/SuccessCard'
import AdminDashboard from '../screens/AdminDashboard'


function App() {
  return (
   <Routes>
    <Route path='/' element={<Index/>} />
    <Route path='/admin/dashboard' element={<AdminDashboard/>} />
    <Route path='/status' element={<Success/>} />
   </Routes>
  )
}

export default App
