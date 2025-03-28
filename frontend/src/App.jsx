

import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import MyChart from "./pages/Chart";
import UsersPage from "./pages/UsersPage";
import AudioTranscriptionRecorder from "./pages/mic";
import HistoryPage from "./pages/History";
import SignIn from "./pages/Login";
import CodeEditor from "./pages/editor";
import ChartsPage from "./pages/DashBoard";
import DynamicTable from "./pages/Data";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (Persist login state)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/signin"); // Redirect to login page if not logged in
    }
  }, [navigate]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Persist login
    navigate("/products"); // Redirect to products page after login
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/signin"); // Redirect to login page after logout
  };

  return (
    <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
			{/* BG */}
			
			<Sidebar />
	  
      <Routes>
		<Route path="/login" element={<SignIn/>}></Route>
		  <Route path="/" element={<ChartsPage/>}></Route>
		  <Route path="/data" element={<DynamicTable/>}/>
           <Route path="/editor" element={<CodeEditor/>}></Route>
            <Route path="/voice" element={<AudioTranscriptionRecorder/>}/>
            <Route path='/users' element={<UsersPage />} />
            <Route path="/charts" element={<MyChart />} />
            <Route path="/history" element={<HistoryPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
