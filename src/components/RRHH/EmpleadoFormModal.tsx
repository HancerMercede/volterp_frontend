import { useTranslation } from "react-i18next";
import { Button, Modal, VolterpMark } from "../../components/UI";
import { FORM_STEPS } from "../../application/hooks/useEmpleadoForm";
import { EmpleadoForm } from "./EmpleadoForm";
import type { EmployeeRequest } from "../../domain/types";

interface Props {
  isOpen: boolean;
  editingId: string | null;
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
  const isLastStep = currentStep === FORM_STEPS.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      onStepChange(currentStep + 1);
      return;
    }
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? t("rrhh.editEmployee") : t("rrhh.newEmployee")}
      icon={<VolterpMark size={40} />}
      size="lg"
      subtitle={t("rrhh.stepProgress", {
        current: currentStep,
        total: FORM_STEPS.length,
      })}
      noValidate
      onSubmit={handleSubmit}
      submitLabel={
        isLastStep
          ? editingId
            ? t("rrhh.saveChanges")
            : t("rrhh.createEmployee")
          : `${t("common.next")} →`
      }
      submitVariant="dark"
      cancelLabel={t("common.cancel")}
      closeLabel={t("common.close")}
      footerActions={
        currentStep > 1 ? (
          <Button
            variant="ghost"
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
          >
            {t("common.previous")}
          </Button>
        ) : null
      }
    >
      <EmpleadoForm
        formData={formData}
        currentStep={currentStep}
        onFieldChange={onFieldChange}
        onStepChange={onStepChange}
      />
    </Modal>
  );
}
