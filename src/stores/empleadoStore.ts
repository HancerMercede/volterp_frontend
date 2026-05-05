import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Empleado } from '../domain/entities/Empleado';
import { empleados as initialEmpleados } from '../data/mockData';

interface EmpleadoStore {
  empleados: Empleado[];
  loading: boolean;
  error: string | null;
  setEmpleados: (empleados: Empleado[]) => void;
  addEmpleado: (empleado: Empleado) => void;
  updateEmpleado: (id: string, data: Partial<Empleado>) => void;
  deleteEmpleado: (id: string) => void;
}

export const useEmpleadoStore = create<EmpleadoStore>()(
  persist(
    (set) => ({
      empleados: initialEmpleados,
      loading: false,
      error: null,

      setEmpleados: (empleados) => set({ empleados }),

      addEmpleado: (empleado) =>
        set((state) => ({
          empleados: [...state.empleados, empleado],
        })),

      updateEmpleado: (id, data) =>
        set((state) => ({
          empleados: state.empleados.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      deleteEmpleado: (id) =>
        set((state) => ({
          empleados: state.empleados.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'empleado-storage',
    }
  )
);