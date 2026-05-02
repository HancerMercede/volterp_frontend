import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import styles from "./Login.module.css";

interface LoginUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  avatar: string;
}

const MOCK_USERS: Record<string, { password: string; user: LoginUser }> = {
  "admin@volterp.com": {
    password: "admin123",
    user: {
      id: "1",
      email: "admin@volterp.com",
      nombre: "Administrador",
      rol: "admin",
      avatar: "",
    },
  },
  "ventas@volterp.com": {
    password: "ventas123",
    user: {
      id: "2",
      email: "ventas@volterp.com",
      nombre: "Vendedor",
      rol: "ventas",
      avatar: "",
    },
  },
};

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email.toLowerCase()];

    if (!mockUser || mockUser.password !== password) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    login(mockUser.user);
    navigate("/");
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <img
            src="/src/assets/logo.svg"
            alt="Volterp"
            width={200}
            height={100}
          />
        </div>

        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Iniciando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.hint}>
          <p>Credenciales de prueba:</p>
          <code>admin@volterp.com / admin123</code>
        </div>
      </div>
    </div>
  );
}
