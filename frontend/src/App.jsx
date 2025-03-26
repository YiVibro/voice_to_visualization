import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './DashBoard'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import { AuthProvider } from './AuthContext'

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Navbar from "./pages/Navbar"
import LoginPage from "./pages/LoginPage"
import PrivateRoute from "./pages/PrivateRoute"

//monaco editor
import MonacoEditorComponent from "./pages/MonacoEditor";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <MonacoEditorComponent />
<AuthProvider>
<Router>
  <Navbar/>
  <Routes>
    <Route path="/" element={<Home/>}></Route>
    <Route path="/about" element={<About/>}></Route>
    <Route path="/contact" element={<Contact/>}></Route>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/dashboard" element={
      <PrivateRoute>
        <Dashboard/>
      </PrivateRoute>
      }/>
  </Routes>
</Router>
</AuthProvider>
    </>
  )
}

export default App
