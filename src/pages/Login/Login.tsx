import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
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
    user: { id: "1", email: "admin@volterp.com", nombre: "Administrador", rol: "admin", avatar: "" },
  },
  "ventas@volterp.com": {
    password: "ventas123",
    user: { id: "2", email: "ventas@volterp.com", nombre: "Vendedor", rol: "ventas", avatar: "" },
  },
};

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[email.toLowerCase()];

    if (!mockUser || mockUser.password !== password) {
      setError("Credenciales incorrectas. Verifique su email y contraseña.");
      setLoading(false);
      return;
    }

    login(mockUser.user);
    navigate("/");
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.logoWrapper}>
            <img src="/src/assets/logo.svg" alt="Volterp" className={styles.logo} />
          </div>
          <h1 className={styles.brandTitle}>Volterp ERP</h1>
          <p className={styles.brandSubtitle}>Sistema de gestión empresarial integral</p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Gestión de ventas y inventario</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Control de nómina y recursos humanos</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Reportes y análisis en tiempo real</span>
            </div>
          </div>
        </div>

        <div className={styles.decorativeCircle} />
        <div className={styles.decorativeCircle2} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Bienvenido</h2>
            <p>Inicie sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.inputGroup} ${focusedField === "email" ? styles.focused : ""} ${error && !email ? styles.error : ""}`}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 6l-10 7L2 6"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="correo@empresa.com"
                  required
                />
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === "password" ? styles.focused : ""} ${error && !password ? styles.error : ""}`}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Recordarme</span>
              </label>
              <a href="#" className={styles.forgotLink}>¿Olvidó su contraseña?</a>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.loadingSpinner} />
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className={styles.demoCredentials}>
            <p>Credenciales de demostración</p>
            <div className={styles.credentials}>
              <span>admin@volterp.com</span>
              <span className={styles.separator}>|</span>
              <span>admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}