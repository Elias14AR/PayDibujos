"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Header.css";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))?.split("=")[1];

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        if (decoded.exp < currentTime) {
          // Si el token ha expirado, eliminarlo y redirigir a login
          document.cookie = "token=; Max-Age=0; path=/"; // Eliminar token
          router.push("/user/login");
          return;
        }
        setUser({ email: decoded.email, role: decoded.role });
      } catch (err) {
        console.error("Token inválido:", err);
        document.cookie = "token=; Max-Age=0; path=/"; // Eliminar token
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    // Eliminar el token de las cookies al hacer logout
    document.cookie = "token=; Max-Age=0; path=/";
    setUser(null);
    router.push("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo-wrapper">
          <div className="header-logo-padding">
            <Image
              src="/principal.png"
              alt="Logo de Pay Dibujos"
              width={80}
              height={80}
              className="header-logo-image"
              priority
            />
          </div>
          <div className="header-text">
            <strong className="header-title">Pay Dibujos</strong>
            <span className="header-subtitle">Ilustración y cómic digital</span>
          </div>
        </div>
      </div>

      <nav aria-label="Navegación principal" className="header-nav">
        <Link href="/" className="header-nav-link">Inicio</Link>

        {!user ? (
          <>
            <Link href="/user/login" className="header-nav-link">Login</Link>
            <Link href="/user/register" className="header-nav-link">Registro</Link>
          </>
        ) : (
          <>
            {user.role === "admin" && (
              <Link href="/admin" className="header-nav-link">Panel</Link>
            )}

            <span className="header-nav-link greeting">
              Hola, {user.email} ({user.role})
            </span>
            <button onClick={handleLogout} className="header-nav-link logout-button">
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
