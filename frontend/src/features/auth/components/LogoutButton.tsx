import React from "react";
import { useAuth } from "../AuthProvider";

export default function LogoutButton(){
    const { logout, loading } = useAuth();

    const handleLogout = async() => {
        try{
            await logout();
        } catch (err: any){
            console.error("Error al cerrar la sesión", err);
        } finally {
            // Asegurar redirección al login sea cual sea el resultado
            try { localStorage.removeItem('auth.tokens'); } catch {};
            window.location.href = "/login";
        }
    };

    return (
        <button onClick={handleLogout} disabled={loading}>
            {loading ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
    );
}