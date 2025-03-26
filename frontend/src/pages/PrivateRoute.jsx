import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({children}){
    const {isAuth}=useContext(AuthContext);

    return isAuth?children:<Navigate to="/login"/>
}