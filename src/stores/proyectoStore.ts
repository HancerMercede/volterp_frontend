import { create } from "zustand";
import { proyectoService } from "../infrastructure/api/proyectoService";
import type { Project } from "../domain/types";

interface ProyectoStore {
  proyectos: Project[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;

  fetchProyectos: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getProyectoById: (id: string) => Promise<Project | null>;
  addProyecto: (proyecto: Partial<Project>) => Promise<Project>;
  updateProyecto: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProyecto: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useProyectoStore = create<ProyectoStore>((set) => ({
  proyectos: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchProyectos: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await proyectoService.getProjects(pageNumber, pageSize);
      set({
        proyectos: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
      });
    }
  },

  getProyectoById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const project = await proyectoService.getProjectById(id);
      set({ loading: false });
      return project;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch project",
      });
      return null;
    }
  },

  addProyecto: async (proyecto: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const newProject = await proyectoService.createProject(proyecto);
      set((state) => ({
        proyectos: [...state.proyectos, newProject],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newProject;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      });
      throw error;
    }
  },

  updateProyecto: async (id: string, data: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await proyectoService.updateProject(id, data);
      set((state) => ({
        proyectos: state.proyectos.map((p) =>
          p.id === id ? { ...p, ...updatedProject } : p,
        ),
        loading: false,
      }));
      return updatedProject;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update project",
      });
      throw error;
    }
  },

  deleteProyecto: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await proyectoService.deleteProject(id);
      set((state) => ({
        proyectos: state.proyectos.filter((p) => p.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
