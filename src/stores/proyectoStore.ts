import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Proyecto } from '../data/mockData';
import { proyectos as initialProyectos } from '../data/mockData';

interface ProyectoStore {
  proyectos: Proyecto[];
  loading: boolean;
  error: string | null;
  setProyectos: (proyectos: Proyecto[]) => void;
  addProyecto: (proyecto: Proyecto) => void;
  updateProyecto: (id: string, data: Partial<Proyecto>) => void;
  deleteProyecto: (id: string) => void;
}

export const useProyectoStore = create<ProyectoStore>()(
  persist(
    (set) => ({
      proyectos: initialProyectos,
      loading: false,
      error: null,

      setProyectos: (proyectos) => set({ proyectos }),

      addProyecto: (proyecto) =>
        set((state) => ({
          proyectos: [...state.proyectos, proyecto],
        })),

      updateProyecto: (id, data) =>
        set((state) => ({
          proyectos: state.proyectos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProyecto: (id) =>
        set((state) => ({
          proyectos: state.proyectos.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'proyecto-storage',
    }
  )
);