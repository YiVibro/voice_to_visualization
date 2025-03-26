import {Link} from "react-router-dom";
import {useContext} from "react";
import { AuthContext } from "../AuthContext";


export default function Navbar()
{
    const {isAuth,logout} =useContext(AuthContext);
    return(
        <nav>
            <ul>
            <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>

        {isAuth?(<li><button onClick={logout}>Logout</button></li>):
        (<li><Link to="/login"></Link></li>)}
            </ul>
        </nav>
    )
}