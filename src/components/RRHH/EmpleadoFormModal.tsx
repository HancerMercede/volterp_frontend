import { useTranslation } from "react-i18next";
import { Modal } from "../../components/UI";
import { EmpleadoForm } from "./EmpleadoForm";
import type { EmployeeRequest } from "../../domain/types";

interface Props {
  isOpen: boolean;
  editingId: number | null;
  formData: EmployeeRequest;
  currentStep: number;
  onClose: () => void;
  onFieldChange: (path: string, value: unknown) => void;
  onStepChange: (step: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmpleadoFormModal({
  isOpen,
  editingId,
  formData,
  currentStep,
  onClose,
  onFieldChange,
  onStepChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? t("rrhh.editEmployee") : t("rrhh.newEmployee")}
    >
      <EmpleadoForm
        formData={formData}
        currentStep={currentStep}
        editingId={editingId}
        onFieldChange={onFieldChange}
        onStepChange={onStepChange}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
