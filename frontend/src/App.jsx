import {Navigate, Route, Routes} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Qr from "./pages/qr"
import AdminDashboard from "./pages/AdminDashboard"

const App = () => {
  const user = JSON?.parse(localStorage?.getItem("user"))
  return (
    <Routes>
      <Route path="/" element={user ?  <Dashboard/>: <Navigate to={"/login"}/>} />
      <Route path="/admin-dashboard" element={user? <AdminDashboard/> : <Navigate to={"/login"}/>} />
      <Route path="/qr" element={<Qr/>} />
      <Route path="/login" element={<Login/>}/>
    </Routes>
  )
}

export default App