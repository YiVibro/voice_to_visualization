import {useContext} from "react";
import { AuthProvider } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
    const {login}=useContext(AuthProvider);
    const navigate=useNavigate();

    const handleLogin=()=>{
        login();
        navigate("/");//redirect to home page
    };

    return(
        <div>
            <h2>Login Page</h2>
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}