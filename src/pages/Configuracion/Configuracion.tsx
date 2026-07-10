import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../hooks/usePermission";
import { PageHeader, Button } from "../../components/UI";
import { LanguageSwitcher } from "../../components/LanguageSwitcher/LanguageSwitcher";
import { UserManagement } from "../../components/UserManagement/UserManagement";
import { Empresas } from "./Empresas";
import styles from "./Configuracion.module.css";
import { useAuthStore } from "../../stores/authStore";
import { useCompanyStore } from "../../stores/companyStore";
import type { CompanyDto } from "../../domain/types";

export function Configuracion() {
  const { t } = useTranslation();
  const { isAdmin } = usePermission();
  const [activeTab, setActiveTab] = useState<"general" | "users" | "companies">(
    "general",
  );

  const { user } = useAuthStore();
  const {
    currentCompany,
    loading,
    fetchCurrentCompany,
    updateCurrentCompany,
  } = useCompanyStore();

  const handleCompanyChange = (field: keyof CompanyDto, value: string) => {
    if (!currentCompany) return;
    useCompanyStore.setState({
      currentCompany: { ...currentCompany, [field]: value },
    });
  };

  const handleSaveCompany = async () => {
    if (!currentCompany) return;
    try {
      await updateCurrentCompany({
        name: currentCompany.name,
        taxId: currentCompany.taxId,
        logoUrl: currentCompany.logoUrl,
        address: currentCompany.address,
        legalName: currentCompany.legalName,
        phone: currentCompany.phone,
        email: currentCompany.email,
      });
      alert(t("common.saved"));
    } catch (err) {
      console.error("Error saving company:", err);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchCurrentCompany(user.companyId);
    }
  }, [user?.companyId, fetchCurrentCompany]);

  const [config, setConfig] = useState({
    iva: 18,
    moneda: "DOP",
    zonaHoraria: "America/Santo_Domingo",
  });

  return (
    <div>
      <PageHeader
        title={t("configuracion.title")}
        subtitle={t("configuracion.subtitle")}
      />

      {isAdmin && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "general" ? styles.active : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${activeTab === "companies" ? styles.active : ""}`}
            onClick={() => setActiveTab("companies")}
          >
            {t("empresas.title")}
          </button>
          <button
            className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            {t("configuracion.users")}
          </button>
        </div>
      )}

      {activeTab === "general" && (
        <div className={styles.sections}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {t("configuracion.companyData")}
            </h3>
            {loading ? (
              <p>Cargando...</p>
            ) : currentCompany ? (
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>{t("configuracion.companyName")}</label>
                  <input
                    type="text"
                    value={currentCompany.name}
                    onChange={(e) =>
                      handleCompanyChange("name", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("configuracion.companyRNC")}</label>
                  <input
                    type="text"
                    value={currentCompany.taxId}
                    onChange={(e) =>
                      handleCompanyChange("taxId", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("configuracion.companyPhone")}</label>
                  <input
                    type="tel"
                    value={currentCompany.phone}
                    onChange={(e) =>
                      handleCompanyChange("phone", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("configuracion.companyEmail")}</label>
                  <input
                    type="email"
                    value={currentCompany.email}
                    onChange={(e) =>
                      handleCompanyChange("email", e.target.value)
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t("configuracion.companyAddress")}</label>
                  <input
                    type="text"
                    value={currentCompany.address}
                    onChange={(e) =>
                      handleCompanyChange("address", e.target.value)
                    }
                  />
                </div>
                <Button onClick={handleSaveCompany}>{t("common.save")}</Button>
              </div>
            ) : (
              <p>No se encontró la empresa</p>
            )}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {t("configuracion.generalSettings")}
            </h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>{t("configuracion.ivaPercentage")}</label>
                <input
                  type="number"
                  value={config.iva}
                  onChange={(e) =>
                    setConfig({ ...config, iva: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t("configuracion.currency")}</label>
                <select
                  value={config.moneda}
                  onChange={(e) =>
                    setConfig({ ...config, moneda: e.target.value })
                  }
                >
                  <option value="DOP">{t("configuracion.currencyDOP")}</option>
                  <option value="USD">{t("configuracion.currencyUSD")}</option>
                  <option value="EUR">{t("configuracion.currencyEUR")}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{t("configuracion.timezone")}</label>
                <select
                  value={config.zonaHoraria}
                  onChange={(e) =>
                    setConfig({ ...config, zonaHoraria: e.target.value })
                  }
                >
                  <option value="America/Santo_Domingo">
                    Santo Domingo (GMT-4)
                  </option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
              <Button>{t("common.save")}</Button>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {t("configuracion.language")}
            </h3>
            <div className={styles.form}>
              <LanguageSwitcher />
              <p className={styles.hint}>{t("configuracion.languageHint")}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "companies" && <Empresas />}

      {activeTab === "users" && <UserManagement />}
    </div>
  );
}
