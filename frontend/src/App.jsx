import {Navigate, Route, Routes} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Qr from "./pages/qr"
import AdminDashboard from "./pages/AdminDashboard"

const App = () => {
  const user = JSON?.parse(localStorage?.getItem("user"))
  console.log(user);
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/admin-dashboard" element={<AdminDashboard/>} />
      <Route path="/qr" element={<Qr/>} />
      <Route path="/login" element={<Login/>}/>
    </Routes>
  )
}

export default App