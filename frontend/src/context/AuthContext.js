import { createContext, useEffect, useState } from "react";

export const AuthContext=createContext();
export const AuthProvider=({children})=>{
    const[user, setUser]=useState(null);
    const[loading, setLoading]=useState(true);

    const initiaizeAuth=async()=>{
        const token=localStorage.getItem("token");
        console.log(token, "token");

        if(token){
            try{
                const response=await fetch(`${process.env.REACT_APP_API}/api/me`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if(response.ok){
                    const userData=await response.json();
                    setUser(userData);
                } else{
                    localStorage.removeItem("token");
                }

            } catch(error){
                console.log("Auth initialization error", error);
                localStorage.removeItem("token");

            }
        }
        setLoading(false);
    };
    useEffect(()=>{
        initiaizeAuth();
    }, []);

    const login = (token, userData, adminId = null) => {
  localStorage.setItem("token", token);
  if (adminId) {
    localStorage.setItem("adminId", adminId);
  } else {
    localStorage.removeItem("adminId");
  }
  setUser(userData);
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminId"); 
  setUser(null);
};

    return(
        <AuthContext.Provider value={{user, loading, login, logout, setUser}}>
            {children}
        </AuthContext.Provider>
    );
};