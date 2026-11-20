import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/UI";
import styles from "./FacturacionElectronica.module.css";

/**
 * Hub of the electronic invoicing module. Each card is one of the six
 * screens the module is made of, in the order the tenant works with it:
 * who signs, which ranges it may use, with which certificate, what it
 * emitted, what it received and how it issues.
 */
const SECTIONS = [
  {
    path: "/facturacion/emisores",
    labelKey: "facturacion.nav.issuers",
    descriptionKey: "facturacion.issuers.subtitle",
  },
  {
    path: "/facturacion/rangos",
    labelKey: "facturacion.nav.ranges",
    descriptionKey: "facturacion.ranges.subtitle",
  },
  {
    path: "/facturacion/certificados",
    labelKey: "facturacion.nav.certificates",
    descriptionKey: "facturacion.certificates.subtitle",
  },
  {
    path: "/facturacion/comprobantes",
    labelKey: "facturacion.nav.invoices",
    descriptionKey: "facturacion.invoices.subtitle",
  },
  {
    path: "/facturacion/recepcion",
    labelKey: "facturacion.nav.reception",
    descriptionKey: "facturacion.reception.subtitle",
  },
  {
    path: "/facturacion/configuracion",
    labelKey: "facturacion.nav.settings",
    descriptionKey: "facturacion.settings.subtitle",
  },
] as const;

export function FacturacionElectronica() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("facturacion.title")}
        subtitle={t("facturacion.subtitle")}
      />

      <div className={styles.grid}>
        {SECTIONS.map((section) => (
          <button
            key={section.path}
            type="button"
            className={styles.card}
            onClick={() => navigate(section.path)}
          >
            <span className={styles.cardTitle}>{t(section.labelKey)}</span>
            <span className={styles.cardDescription}>
              {t(section.descriptionKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
