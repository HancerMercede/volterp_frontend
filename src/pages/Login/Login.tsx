import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Diamond,
  BarChart3,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../infrastructure/api/authService";
import styles from "./Login.module.css";
import { ExpirationSession } from "../ExpirationSession/ExpirationSession";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show session expired banner when redirected from auto-logout
  const sessionExpired =
    (location.state as { expired?: boolean } | null)?.expired === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });

      const user = {
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        role: response.role.toLowerCase(),
        companyId: response.companyId,
      };

      login(user, response.token, rememberMe);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.invalidCredentials"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.logoWrapper}>
            <img
              src="/src/assets/logo.svg"
              alt="Volterp"
              className={styles.logo}
            />
          </div>
          <h1 className={styles.brandTitle}>
            Volterp<span className={styles.brandTitleAccent}> ERP</span>
          </h1>
          <p className={styles.brandSubtitle}>
            Sistema de gestión empresarial integral
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconGold}`}
              >
                <Zap size={20} strokeWidth={1.8} />
              </span>
              <span>Gestión de ventas e inventario</span>
            </div>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconTeal}`}
              >
                <Diamond size={20} strokeWidth={1.8} />
              </span>
              <span>Control de nómina y recursos humanos</span>
            </div>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconEmerald}`}
              >
                <BarChart3 size={20} strokeWidth={1.8} />
              </span>
              <span>Reportes y análisis en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{t("auth.welcome")}</h2>
            <p>{t("auth.loginSubtitle")}</p>
          </div>

          {sessionExpired && (
            <ExpirationSession styles={styles.sessionExpiredBanner} />
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div
              className={`${styles.inputGroup} ${error ? styles.error : ""}`}
            >
              <label htmlFor="username">{t("auth.username")}</label>
              <div className={styles.inputWrapper}>
                <User
                  className={styles.inputIcon}
                  size={18}
                  strokeWidth={1.8}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("auth.username")}
                  required
                />
              </div>
            </div>

            <div
              className={`${styles.inputGroup} ${error ? styles.error : ""}`}
            >
              <label htmlFor="password">{t("auth.password")}</label>
              <div className={styles.inputWrapper}>
                <Lock
                  className={styles.inputIcon}
                  size={18}
                  strokeWidth={1.8}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
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
                <span>{t("auth.rememberMe")}</span>
              </label>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => alert(t("auth.forgotPassword"))}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={18} strokeWidth={1.8} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingSpinner} />
              ) : (
                <>
                  <span>{t("auth.login")}</span>
                  <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className={styles.registerLink}>
            <p>
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/register">{t("auth.createAccount")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
