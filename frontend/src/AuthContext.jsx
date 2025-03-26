import {createContext,useState} from 'react';

export const AuthContext=createContext();

export function AuthProvider({children}){
    const [isAuth,setIsAuth]=useState(false);

    //login function
    const login=()=>{setIsAuth(true)};
    //logout funtion
    const logout=()=>{setIsAuth(false)};

    return(
        <AuthContext.Provider value={{isAuth,login,logout}}>
            {children}
        </AuthContext.Provider>
    )

}