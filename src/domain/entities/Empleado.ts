export type Genero = "M" | "F" | "Otro";
export type EstadoCivil = "soltero" | "casado" | "divorciado" | "viudo";
export type EstadoEmpleado = "activo" | "inactivo" | "vacaciones" | "licencia";
export type TipoContrato = "indefinido" | "temporal" | "por_proyecto" | "suplencia";
export type PeriodicidadPago = "semanal" | "quincenal" | "mensual";

export interface InformacionPersonal {
  cedula: string;
  fechaNacimiento: string;
  genero: Genero;
  estadoCivil: EstadoCivil;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion: string;
}

export interface InformacionFiscal {
  afp: string;
  afpNumero: string;
  ars: string;
  arsNumero: string;
  nss: string;
}

export interface CuentaBancaria {
  banco: string;
  numeroCuenta: string;
  tipoCuenta: "ahorro" | "corriente";
}

export interface Empleado {
  id: string;
  avatar: string;
  estado: EstadoEmpleado;

  nombre: string;
  informacionPersonal: InformacionPersonal;
  emailLaboral: string;
  emailPersonal: string;
  telefonoLaboral: string;
  telefonoPersonal: string;
  direccion: string;
  ciudad: string;

  contactoEmergencia: ContactoEmergencia;
  informacionFiscal: InformacionFiscal;

  cargo: string;
  departamento: string;
  jefeDirectoId: string | null;
  tipoContrato: TipoContrato;
  fechaIngreso: string;
  fechaAntiguedad: string;
  horarioLaboral: string;
  ubicacion: string;

  salarioBase: number;
  periodicidadPago: PeriodicidadPago;
  cuentaBancaria: CuentaBancaria;

  createdAt: string;
  updatedAt: string;
}