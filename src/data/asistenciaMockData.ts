import type { RegistroPonche, HorarioEmpleado, ConfiguracionAsistencia } from '../domain/entities/Asistencia';

export const configuracionAsistenciaDefault: ConfiguracionAsistencia = {
  enabled: true,
  rangoMetros: 100,
  generaHorasExtras: true,
  horasLaboralesBase: 8,
  umbralHorasExtra: 9,
};

export const horariosMock: HorarioEmpleado[] = [
  {
    id: 'HOR001',
    empleadoId: 'EMP001',
    horaEntrada: '08:00',
    horaSalida: '17:00',
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    ubicacionSucursal: { lat: 18.4861, lng: -69.9312, direccion: 'Av. 27 de Febrero, Sto. Dgo.', radioMetros: 100 },
    permiteHorasExtras: true,
    horaExtraInicio: '17:00',
  },
  {
    id: 'HOR002',
    empleadoId: 'EMP002',
    horaEntrada: '08:00',
    horaSalida: '17:00',
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    ubicacionSucursal: { lat: 18.4861, lng: -69.9312, direccion: 'Av. 27 de Febrero, Sto. Dgo.', radioMetros: 100 },
    permiteHorasExtras: true,
    horaExtraInicio: '17:00',
  },
  {
    id: 'HOR003',
    empleadoId: 'EMP003',
    horaEntrada: '09:00',
    horaSalida: '18:00',
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    ubicacionSucursal: { lat: 18.4861, lng: -69.9312, direccion: 'Av. 27 de Febrero, Sto. Dgo.', radioMetros: 100 },
    permiteHorasExtras: false,
    horaExtraInicio: '18:00',
  },
  {
    id: 'HOR004',
    empleadoId: 'EMP004',
    horaEntrada: '08:00',
    horaSalida: '16:00',
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    ubicacionSucursal: { lat: 18.4861, lng: -69.9312, direccion: 'Av. 27 de Febrero, Sto. Dgo.', radioMetros: 100 },
    permiteHorasExtras: false,
    horaExtraInicio: '16:00',
  },
  {
    id: 'HOR005',
    empleadoId: 'EMP005',
    horaEntrada: '07:00',
    horaSalida: '15:00',
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    ubicacionSucursal: { lat: 18.4861, lng: -69.9312, direccion: 'Av. 27 de Febrero, Sto. Dgo.', radioMetros: 100 },
    permiteHorasExtras: true,
    horaExtraInicio: '15:00',
  },
];

function generarAsistenciaEmpleado(empleadoId: string, fecha: string, horaEntradaEsperada: string, esTardanza: boolean, esAusencia: boolean, horaSalida?: string): RegistroPonche[] {
  const registros: RegistroPonche[] = [];

  if (esAusencia) {
    return [];
  }

  const [horaE, minE] = horaEntradaEsperada.split(':').map(Number);
  let horaEntradaReal = horaEntradaEsperada;
  let estadoEntrada: 'a_tiempo' | 'tardanza' = 'a_tiempo';

  if (esTardanza) {
    const tardanzaMin = Math.floor(Math.random() * 30) + 5;
    horaEntradaReal = `${String(horaE).padStart(2, '0')}:${String(minE + tardanzaMin).padStart(2, '0')}`;
    estadoEntrada = 'tardanza';
  }

  registros.push({
    id: `${empleadoId}-${fecha}-entrada`,
    empleadoId,
    fecha,
    hora: horaEntradaReal,
    tipo: 'entrada',
    estado: estadoEntrada,
    ubicacion: { lat: 18.4861 + (Math.random() - 0.5) * 0.001, lng: -69.9312 + (Math.random() - 0.5) * 0.001 },
    creadoEn: `${fecha}T${horaEntradaReal}:00`,
  });

  if (horaSalida) {
    registros.push({
      id: `${empleadoId}-${fecha}-salida`,
      empleadoId,
      fecha,
      hora: horaSalida,
      tipo: 'salida',
      estado: 'a_tiempo',
      ubicacion: { lat: 18.4861 + (Math.random() - 0.5) * 0.001, lng: -69.9312 + (Math.random() - 0.5) * 0.001 },
      creadoEn: `${fecha}T${horaSalida}:00`,
    });
  }

  return registros;
}

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function generarHistorial(asistenciaEmpleados: Map<string, { tardanza: number; ausencia: number; conHorasExtras: number }>) {
  const registros: RegistroPonche[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = getDaysInMonth(year, month);

  const empleadoIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010', 'EMP011', 'EMP012', 'EMP013', 'EMP014', 'EMP015'];
  const horasEntrada = ['08:00', '08:00', '09:00', '08:00', '07:00', '08:30', '08:00', '09:00', '08:00', '08:00', '07:30', '08:00', '09:30', '08:00', '08:00'];
  const horasSalida = ['17:00', '17:00', '18:00', '16:00', '15:00', '17:30', '18:00', '18:00', '17:00', '17:00', '16:30', '17:00', '19:00', '17:00', '17:30'];

  days.forEach((fecha) => {
    const date = new Date(fecha);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) return;

    empleadoIds.forEach((empId, idx) => {
      const stats = asistenciaEmpleados.get(empId) || { tardanza: 0, ausencia: 0, conHorasExtras: 0 };
      const rand = Math.random();

      let esTardanza = false;
      let esAusencia = false;
      let conHorasExtras = false;

      if (stats.ausencia < 3) {
        esAusencia = rand < 0.05;
        if (esAusencia) stats.ausencia++;
      }

      if (!esAusencia && stats.tardanza < 5) {
        esTardanza = rand < 0.15;
        if (esTardanza) stats.tardanza++;
      }

      if (!esAusencia && stats.conHorasExtras < 4) {
        conHorasExtras = rand < 0.1;
        if (conHorasExtras) {
          stats.conHorasExtras++;
        }
      }

      let horaSalida = horasSalida[idx];
      if (conHorasExtras) {
        const [h, m] = horaSalida.split(':').map(Number);
        const extraH = Math.floor(Math.random() * 2) + 1;
        horaSalida = `${String(h + extraH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }

      const regs = generarAsistenciaEmpleado(empId, fecha, horasEntrada[idx], esTardanza, esAusencia, conHorasExtras || Math.random() < 0.9 ? horaSalida : undefined);
      registros.push(...regs);
    });
  });

  return registros;
}

const asistenciaEmpleados = new Map<string, { tardanza: number; ausencia: number; conHorasExtras: number }>();
for (let i = 1; i <= 15; i++) {
  asistenciaEmpleados.set(`EMP${String(i).padStart(3, '0')}`, { tardanza: 0, ausencia: 0, conHorasExtras: 0 });
}

export const registrosAsistenciaMock: RegistroPonche[] = generarHistorial(asistenciaEmpleados);

export const resumenAsistencia: { empleadoId: string; totalDias: number; diasAsistidos: number; tardanzas: number; horasRegulares: number; horasExtras: number }[] = Array.from(asistenciaEmpleados.entries()).map(([empId]) => ({
  empleadoId: empId,
  totalDias: 22,
  diasAsistidos: Math.floor(Math.random() * 3) + 19,
  tardanzas: Math.floor(Math.random() * 5),
  horasRegulares: 176,
  horasExtras: Math.floor(Math.random() * 20),
}));