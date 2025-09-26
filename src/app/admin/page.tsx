"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))?.split("=")[1];

    if (!token) {
      router.push("/user/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        router.push("/");
      }
    } catch (err) {
      console.error("Token inválido:", err);
      router.push("/user/login");
    }
  }, [router]);

  const handleSearch = async () => {
    const isValidEmail = /^\S+@\S+\.\S+$/.test(searchEmail);
    if (!isValidEmail) {
      alert("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))?.split("=")[1];

      const res = await fetch(`/api/admin/users?email=${searchEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error obteniendo usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Administración</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {users.length > 0 ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results">No se encontraron usuarios</p>
      )}
    </div>
  );
}
