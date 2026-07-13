import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

interface ExpirationSessionProps {
  styles: string;
}

export const ExpirationSession = ({ styles }: ExpirationSessionProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles}>
      <AlertTriangle size={18} strokeWidth={1.8} /> {t("auth.sessionExpired")}
    </div>
  );
};
