import { useCallback, useState } from "react";
import { useUIStore } from "../stores/uiStore";

export interface DeleteConfirmConfig {
  onDelete: (id: string) => Promise<void>;
  successMessage: string;
}

export interface DeleteConfirmReturn {
  showDeleteConfirm: boolean;
  deleteId: string | null;
  handleDelete: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

const DEFAULT_ERROR_MESSAGE = "Error al eliminar";

export function useDeleteConfirm({
  onDelete,
  successMessage,
}: DeleteConfirmConfig): DeleteConfirmReturn {
  const { addToast } = useUIStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  // deleteId is cleared by cancelDelete, not here: a delete still in flight
  // must not wipe a selection made after it started.
  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      await onDelete(deleteId);
      addToast(successMessage, "success");
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : DEFAULT_ERROR_MESSAGE;
      addToast(message, "error");
    }
  }, [deleteId, onDelete, successMessage, addToast]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, []);

  return {
    showDeleteConfirm,
    deleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
  };
}
