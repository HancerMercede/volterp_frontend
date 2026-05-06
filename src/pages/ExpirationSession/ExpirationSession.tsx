import { useTranslation } from "react-i18next";

interface ExpirationSessionProps {
  styles: string;
}

export const ExpirationSession = ({ styles }: ExpirationSessionProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles}>
      <span>⚠️</span> {t("auth.sessionExpired")}
    </div>
  );
};
