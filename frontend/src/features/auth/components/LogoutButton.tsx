import React from "react";
import { useAuth } from "../AuthProvider";

export default function LogoutButton(){
    const {logout,loading} = useAuth(); 

    const handleLogout = async() => {
        try{
            await logout(); 

            //Redirigir al login despues del logout
            window.location.href = "/login";
        } catch (err: any){
            console.error("Error al cerrar la sesión", err);
            alert("Error al cerrar la sesión: " + (err.message || "Error desconocido"));
        }
    };

    return (
        <button onClick={handleLogout} disabled={loading}>
            {loading ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
    );
}