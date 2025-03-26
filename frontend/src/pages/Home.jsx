import React,{useContext} from "react";
import { AuthContext } from "../AuthContext";

export default function Home()
{
    const {isAuth,login,logout} =useContext(AuthContext);

    return(
        <div>
            <h1>{isAuth?"User is logged in":"User logged out"}</h1>
            <button onClick={isAuth?logout:login}>
                    {isAuth?"Logout":"Login"}
            </button>
        </div>
    )
}