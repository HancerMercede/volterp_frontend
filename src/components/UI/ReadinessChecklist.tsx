import { useTranslation } from "react-i18next";
import type {
  FiscalBlockerDto,
  FiscalReadinessDocumentTypeDto,
  FiscalReadinessDto,
} from "../../domain/types";
import { Table } from "./Table";
import styles from "./ReadinessChecklist.module.css";

export type ReadinessVariant = "compact" | "full";

export interface ReadinessChecklistProps {
  /** "compact" for the POS (one line), "full" for the configuration. */
  variant: ReadinessVariant;
  readiness: FiscalReadinessDto | null;
  loading?: boolean;
  error?: string | null;
}

type ReadinessState = "loading" | "ready" | "notReady" | "unverified";

/**
 * The class that carries the colour of the state: the colours live in the
 * module of the component, the component only says which state it shows.
 */
function toneClass(state: ReadinessState): string {
  switch (state) {
    case "ready":
      return styles.toneReady;
    case "notReady":
      return styles.toneNotReady;
    default:
      return styles.toneUnverified;
  }
}

/** The day an ISO instant names, as the day it is: the hour never moves the date to another day. */
function formatDay(value: string): string {
  const day = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (day) return day[1];

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

/** A row of the table of the types: the type and its code as the key. */
interface ReadinessRow {
  id: string;
  type: FiscalReadinessDocumentTypeDto;
}

/**
 * Whether the taxpayer can bill right now. The component does not fetch
 * anything: the data comes from the hook of the case (`useFiscalReadiness`)
 * and the variant is the one the screen asks for. The message of the backend
 * is never shown: the code of the blocker is translated here and the sentence
 * is built with the data the DTO carries.
 */
export function ReadinessChecklist({
  variant,
  readiness,
  loading = false,
  error = null,
}: ReadinessChecklistProps) {
  const { t } = useTranslation();

  const compact = variant === "compact";

  const state: ReadinessState = (() => {
    if (loading) return "loading";
    if (error || !readiness) return "unverified";
    return readiness.isReady ? "ready" : "notReady";
  })();

  const headline = (() => {
    if (compact) {
      if (state === "loading") return t("ventas.readiness.compactLoading");
      if (state === "ready") return t("ventas.readiness.compactReady");
      if (state === "notReady") return t("ventas.readiness.compactNotReady");
      return t("ventas.readiness.compactUnverified");
    }

    if (state === "loading") return t("ventas.readiness.fullLoading");
    if (state === "ready") return t("ventas.readiness.fullReady");
    if (state === "notReady") return t("ventas.readiness.fullNotReady");
    return t("ventas.readiness.fullUnverified");
  })();

  // The kind of the ranges of the path the sale takes today: e-NCF for the electronic one, NCF for the paper one.
  const kind = readiness?.usesElectronicEmission
    ? t("ventas.readiness.kindElectronic")
    : t("ventas.readiness.kindPaper");

  /** The sentence of a blocker: the code is translated and the data of the type builds it. */
  const sentenceOf = (
    code: string,
    type?: FiscalReadinessDocumentTypeDto,
  ): string => {
    switch (code) {
      case "certificate-missing":
        return t("ventas.readiness.blockers.certificateMissing");
      case "range-missing":
        return type
          ? t("ventas.readiness.blockers.rangeMissing", {
              kind,
              code: type.code,
            })
          : t("ventas.readiness.blockers.unknown");
      case "range-expired":
        if (!type) return t("ventas.readiness.blockers.unknown");
        return type.rangeExpiresAt
          ? t("ventas.readiness.blockers.rangeExpired", {
              kind,
              code: type.code,
              expiresAt: formatDay(type.rangeExpiresAt),
            })
          : t("ventas.readiness.blockers.rangeExpiredNoDate", {
              kind,
              code: type.code,
            });
      case "range-exhausted":
        return type
          ? t("ventas.readiness.blockers.rangeExhausted", {
              kind,
              code: type.code,
              remaining: type.remaining,
            })
          : t("ventas.readiness.blockers.unknown");
      case "range-annulled":
        return type
          ? t("ventas.readiness.blockers.rangeAnnulled", {
              kind,
              code: type.code,
            })
          : t("ventas.readiness.blockers.unknown");
      case "range-without-expiry":
        return type
          ? t("ventas.readiness.blockers.rangeWithoutExpiry", {
              kind,
              code: type.code,
            })
          : t("ventas.readiness.blockers.unknown");
      default:
        return t("ventas.readiness.blockers.unknown");
    }
  };

  /**
   * The type a blocker speaks of: the backend names it in the blocker itself
   * (`documentTypeCode`), so the type is found by its code.
   */
  const typeOfBlocker = (
    blocker: FiscalBlockerDto,
  ): FiscalReadinessDocumentTypeDto | undefined => {
    if (!readiness || !blocker.documentTypeCode) return undefined;

    return readiness.documentTypes.find(
      (type) => type.code === blocker.documentTypeCode,
    );
  };

  const reasons =
    state === "notReady" && readiness
      ? readiness.blockers.map((blocker) =>
          sentenceOf(blocker.code, typeOfBlocker(blocker)),
        )
      : [];

  const pathText = !readiness
    ? ""
    : readiness.usesElectronicEmission
      ? t("ventas.readiness.pathElectronic")
      : t("ventas.readiness.pathPaper");

  const certificateText = (() => {
    if (!readiness) return "";
    // The taxpayer that issues on paper does not sign anything.
    if (!readiness.usesElectronicEmission)
      return t("ventas.readiness.certificateNotNeeded");
    if (!readiness.hasValidCertificate)
      return t("ventas.readiness.certificateMissing");
    if (readiness.certificateExpiresAt)
      return t("ventas.readiness.certificateValid", {
        date: formatDay(readiness.certificateExpiresAt),
      });
    return t("ventas.readiness.certificateValidNoDate");
  })();

  const rows: ReadinessRow[] = (readiness?.documentTypes ?? []).map((type) => ({
    id: type.code,
    type,
  }));

  const columns = [
    {
      key: "type",
      header: t("ventas.readiness.type"),
      render: (row: ReadinessRow) => (
        <span>
          <strong>{row.type.code}</strong>
          <span className={styles.typeName}>{row.type.name}</span>
        </span>
      ),
    },
    {
      key: "remaining",
      header: t("ventas.readiness.remaining"),
      render: (row: ReadinessRow) => String(row.type.remaining),
    },
    {
      key: "expiresAt",
      header: t("ventas.readiness.expiresAt"),
      render: (row: ReadinessRow) =>
        row.type.rangeExpiresAt
          ? formatDay(row.type.rangeExpiresAt)
          : t("ventas.readiness.noExpiry"),
    },
    {
      key: "status",
      header: t("ventas.readiness.status"),
      render: (row: ReadinessRow) =>
        row.type.isIssuable
          ? t("ventas.readiness.issuable")
          : sentenceOf(row.type.blockerCode ?? "", row.type),
    },
  ];

  if (compact) {
    return (
      <div
        role="status"
        className={`${styles.compact} ${toneClass(state)}`}
      >
        <span className={styles.headline}>{headline}</span>
        {reasons.length > 0 && (
          <span>{" — "}{reasons.join(" · ")}</span>
        )}
      </div>
    );
  }

  return (
    <section
      role="region"
      aria-label={t("ventas.readiness.fullTitle")}
      className={styles.panel}
    >
      <h3 className={styles.title}>{t("ventas.readiness.fullTitle")}</h3>

      <p className={`${styles.badge} ${toneClass(state)}`}>{headline}</p>

      {reasons.length > 0 && (
        <>
          <p className={styles.reasonsTitle}>{t("ventas.readiness.reasons")}</p>
          <ul className={styles.reasons}>
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </>
      )}

      {readiness && (
        <>
          <dl className={styles.facts}>
            <dt className={styles.factName}>{t("ventas.readiness.path")}</dt>
            <dd className={styles.factValue}>
              {pathText}
              {readiness.isInContingency && (
                <span className={styles.note}>
                  {" — "}
                  {t("ventas.readiness.contingency")}
                </span>
              )}
            </dd>

            <dt className={styles.factName}>
              {t("ventas.readiness.certificate")}
            </dt>
            <dd className={styles.factValue}>{certificateText}</dd>
          </dl>

          <h4 className={styles.typesTitle}>{t("ventas.readiness.types")}</h4>

          <Table data={rows} columns={columns} />
        </>
      )}
    </section>
  );
}
