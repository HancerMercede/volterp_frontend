import { create } from "zustand";
import { employeeService } from "../infrastructure/api/employeeService";
import type { EmployeeDto, EmployeeRequest } from "../domain/types";

interface EmpleadoStore {
  empleados: EmployeeDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;

  fetchEmpleados: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getEmpleadoById: (id: number) => Promise<EmployeeDto | null>;
  addEmpleado: (empleado: EmployeeRequest) => Promise<EmployeeDto>;
  updateEmpleado: (
    id: number,
    data: Partial<EmployeeDto>,
  ) => Promise<EmployeeDto>;
  deleteEmpleado: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useEmpleadoStore = create<EmpleadoStore>((set) => ({
  empleados: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchEmpleados: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await employeeService.getEmployees(pageNumber, pageSize);
      set({
        empleados: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch employees",
      });
    }
  },

  getEmpleadoById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const employee = await employeeService.getEmployee(id);
      set({ loading: false });
      return employee;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch employee",
      });
      return null;
    }
  },

  addEmpleado: async (empleado: EmployeeRequest) => {
    set({ loading: true, error: null });
    try {
      const newEmployee = await employeeService.createEmployee(empleado);
      set((state) => ({
        empleados: [...state.empleados, newEmployee],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newEmployee;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create employee",
      });
      throw error;
    }
  },

  updateEmpleado: async (id: number, data: Partial<EmployeeDto>) => {
    set({ loading: true, error: null });
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, data);
      set((state) => ({
        empleados: state.empleados.map((e) =>
          e.id === id ? { ...e, ...updatedEmployee } : e,
        ),
        loading: false,
      }));
      return updatedEmployee;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update employee",
      });
      throw error;
    }
  },

  deleteEmpleado: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await employeeService.deleteEmployee(id);
      set((state) => ({
        empleados: state.empleados.filter((e) => e.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete employee",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
