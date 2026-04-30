export interface Venta {
  id: string;
  cliente: string;
  clienteId: string;
  producto: string;
  productoId: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

export interface Compra {
  id: string;
  proveedor: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'recibida' | 'pendiente' | 'cancelada';
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
  proveedor: string;
  imagen: string;
  descripcion: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  totalCompras: number;
  avatar: string;
  empresa?: string;
}

export const clientes: Cliente[] = [
  { 
    id: 'CL001', 
    nombre: 'Carlos Mendoza', 
    email: 'carlos@email.com', 
    telefono: '809-123-4567', 
    direccion: 'Av. Principal 123, Santo Domingo', 
    totalCompras: 45000,
    avatar: 'https://i.pravatar.cc/150?img=11',
    empresa: 'Tech Solutions RD'
  },
  { 
    id: 'CL002', 
    nombre: 'María García', 
    email: 'maria@email.com', 
    telefono: '809-234-5678', 
    direccion: 'Calle Norte 456, Santiago', 
    totalCompras: 28500,
    avatar: 'https://i.pravatar.cc/150?img=5',
    empresa: 'Inversiones García'
  },
  { 
    id: 'CL003', 
    nombre: 'Juan López', 
    email: 'juan@email.com', 
    telefono: '809-345-6789', 
    direccion: 'Av. Sur 789, La Romana', 
    totalCompras: 32000,
    avatar: 'https://i.pravatar.cc/150?img=12',
    empresa: 'López & Asocs'
  },
  { 
    id: 'CL004', 
    nombre: 'Ana Torres', 
    email: 'ana@email.com', 
    telefono: '809-456-7890', 
    direccion: 'Calle Este 012, San Cristóbal', 
    totalCompras: 18500,
    avatar: 'https://i.pravatar.cc/150?img=9',
    empresa: 'Torres Consultores'
  },
  { 
    id: 'CL005', 
    nombre: 'Pedro Ruiz', 
    email: 'pedro@email.com', 
    telefono: '809-567-8901', 
    direccion: 'Av. Oeste 345, San Francisco de Macorís', 
    totalCompras: 52000,
    avatar: 'https://i.pravatar.cc/150?img=8',
    empresa: 'Distribuciones Ruiz'
  },
  { 
    id: 'CL006', 
    nombre: 'Laura Díaz', 
    email: 'laura@email.com', 
    telefono: '809-678-9012', 
    direccion: 'Calle María 789, Puerto Plata', 
    totalCompras: 15800,
    avatar: 'https://i.pravatar.cc/150?img=20',
    empresa: 'Diaz Import'
  },
  { 
    id: 'CL007', 
    nombre: 'Roberto Sánchez', 
    email: 'roberto@email.com', 
    telefono: '809-789-0123', 
    direccion: 'Av. Las Américas 100, Santo Domingo', 
    totalCompras: 38000,
    avatar: 'https://i.pravatar.cc/150?img=13',
    empresa: 'Sánchez Corp'
  },
];

export const productos: Producto[] = [
  { 
    id: 'P001', 
    nombre: 'Laptop HP Pavilion 15', 
    categoria: 'Computación', 
    stock: 15, 
    precio: 45990, 
    proveedor: 'TechDistributor',
    imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    descripcion: 'Laptop 15.6" Intel Core i7, 16GB RAM, 512GB SSD'
  },
  { 
    id: 'P002', 
    nombre: 'Mouse Logitech MX Master 3', 
    categoria: 'Accesorios', 
    stock: 45, 
    precio: 4500, 
    proveedor: 'ElectroMax',
    imagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
    descripcion: 'Mouse inalambrico ergonomic con scroll magico'
  },
  { 
    id: 'P003', 
    nombre: 'Monitor Samsung 27" 4K', 
    categoria: 'Computación', 
    stock: 8, 
    precio: 28900, 
    proveedor: 'DisplayPro',
    imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop',
    descripcion: 'Monitor 4K UHD con puertos HDMI y DisplayPort'
  },
  { 
    id: 'P004', 
    nombre: 'Teclado Mecánico Corsair K70', 
    categoria: 'Accesorios', 
    stock: 22, 
    precio: 8900, 
    proveedor: 'KeyMaster',
    imagen: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&h=200&fit=crop',
    descripcion: 'Teclado mecanico RGB switches Cherry MX'
  },
  { 
    id: 'P005', 
    nombre: 'Auriculares Sony WH-1000XM4', 
    categoria: 'Audio', 
    stock: 0, 
    precio: 15990, 
    proveedor: 'AudioWorld',
    imagen: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&h=200&fit=crop',
    descripcion: 'Audifonos Bluetooth noise cancelling'
  },
  { 
    id: 'P006', 
    nombre: 'Webcam Logitech C920', 
    categoria: 'Accesorios', 
    stock: 30, 
    precio: 4500, 
    proveedor: 'ElectroMax',
    imagen: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=200&h=200&fit=crop',
    descripcion: 'Camara web Full HD 1080p'
  },
  { 
    id: 'P007', 
    nombre: 'Escritorio Ejecutivo Moderno', 
    categoria: 'Muebles', 
    stock: 5, 
    precio: 18500, 
    proveedor: 'MueblesPro',
    imagen: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200&h=200&fit=crop',
    descripcion: 'Escritorio de melanina 160x80cm con cajones'
  },
  { 
    id: 'P008', 
    nombre: 'Silla Ergonómica Huelva Pro', 
    categoria: 'Muebles', 
    stock: 12, 
    precio: 12500, 
    proveedor: 'MueblesPro',
    imagen: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&h=200&fit=crop',
    descripcion: 'Silla con soporte lumbar y reposabrazos'
  },
  { 
    id: 'P009', 
    nombre: 'Impresora HP LaserJet Pro', 
    categoria: 'Oficina', 
    stock: 18, 
    precio: 8900, 
    proveedor: 'TechDistributor',
    imagen: 'https://images.unsplash.com/photo-1612815154858-60aa4c11e329?w=200&h=200&fit=crop',
    descripcion: 'Impresora laser monocromatica velocidad 30ppm'
  },
  { 
    id: 'P010', 
    nombre: 'Disco SSD Samsung 1TB', 
    categoria: 'Almacenamiento', 
    stock: 35, 
    precio: 6500, 
    proveedor: 'TechDistributor',
    imagen: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&h=200&fit=crop',
    descripcion: 'SSD NVMe velocidad 3500MB/s'
  },
];

export const ventas: Venta[] = [
  { id: 'V001', cliente: 'Carlos Mendoza', clienteId: 'CL001', producto: 'Laptop HP Pavilion 15', productoId: 'P001', cantidad: 1, total: 45990, fecha: '2026-04-28', estado: 'completada' },
  { id: 'V002', cliente: 'María García', clienteId: 'CL002', producto: 'Mouse Logitech MX Master 3', productoId: 'P002', cantidad: 2, total: 9000, fecha: '2026-04-28', estado: 'completada' },
  { id: 'V003', cliente: 'Juan López', clienteId: 'CL003', producto: 'Monitor Samsung 27" 4K', productoId: 'P003', cantidad: 1, total: 28900, fecha: '2026-04-27', estado: 'pendiente' },
  { id: 'V004', cliente: 'Ana Torres', clienteId: 'CL004', producto: 'Teclado Mecánico Corsair K70', productoId: 'P004', cantidad: 1, total: 8900, fecha: '2026-04-27', estado: 'completada' },
  { id: 'V005', cliente: 'Pedro Ruiz', clienteId: 'CL005', producto: 'Auriculares Sony WH-1000XM4', productoId: 'P005', cantidad: 3, total: 47970, fecha: '2026-04-26', estado: 'cancelada' },
  { id: 'V006', cliente: 'Carlos Mendoza', clienteId: 'CL001', producto: 'Webcam Logitech C920', productoId: 'P006', cantidad: 1, total: 4500, fecha: '2026-04-25', estado: 'completada' },
  { id: 'V007', cliente: 'Laura Díaz', clienteId: 'CL006', producto: 'Impresora HP LaserJet Pro', productoId: 'P009', cantidad: 1, total: 8900, fecha: '2026-04-24', estado: 'completada' },
];

export const compras: Compra[] = [
  { id: 'C001', proveedor: 'TechDistributor', producto: 'Laptop HP Pavilion 15', cantidad: 10, total: 459900, fecha: '2026-04-25', estado: 'recibida' },
  { id: 'C002', proveedor: 'ElectroMax', producto: 'Mouse Logitech MX Master 3', cantidad: 50, total: 225000, fecha: '2026-04-26', estado: 'recibida' },
  { id: 'C003', proveedor: 'DisplayPro', producto: 'Monitor Samsung 27" 4K', cantidad: 20, total: 578000, fecha: '2026-04-27', estado: 'pendiente' },
  { id: 'C004', proveedor: 'KeyMaster', producto: 'Teclado Mecánico Corsair K70', cantidad: 30, total: 267000, fecha: '2026-04-28', estado: 'recibida' },
  { id: 'C005', proveedor: 'AudioWorld', producto: 'Auriculares Sony WH-1000XM4', cantidad: 100, total: 1599000, fecha: '2026-04-29', estado: 'pendiente' },
];

export const dashboardStats = {
  ventas: 145660,
  compras: 3110800,
  clientes: 248,
  utilidad: 325000,
};

export const actividades = [
  { id: 1, texto: 'Nueva venta: Laptop HP Pavilion 15', hora: '10:30 AM', tipo: 'venta' },
  { id: 2, texto: 'Stock bajo en Auriculares Sony', hora: '11:45 AM', tipo: 'alerta' },
  { id: 3, texto: 'Pago recibido de Carlos Mendoza - $45,990', hora: '12:15 PM', tipo: 'pago' },
  { id: 4, texto: 'Nuevo cliente registrado: Laura Díaz', hora: '02:30 PM', tipo: 'cliente' },
  { id: 5, texto: 'Compra pendiente de AudioWorld recibida', hora: '04:00 PM', tipo: 'compra' },
];

export const recordatorios = [
  { id: 1, texto: 'Revisar inventario de productos con stock bajo', fecha: '2026-04-30' },
  { id: 2, texto: 'Enviar reporte mensual a gerencia', fecha: '2026-05-01' },
  { id: 3, texto: 'Reunión con proveedores TechDistributor', fecha: '2026-05-02' },
  { id: 4, texto: 'Renovar licencia de software contable', fecha: '2026-05-05' },
];

export interface Proveedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string;
  totalOrdenes: number;
  avatar: string;
}

export interface TransaccionContable {
  id: string;
  descripcion: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  fecha: string;
  categoria: string;
  estado: 'conciliada' | 'pendiente';
}

export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  email: string;
  telefono: string;
  fechaIngreso: string;
  salario: number;
  avatar: string;
  estado: 'activo' | 'inactivo';
}

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  estado: 'en_progreso' | 'completado' | 'pendiente';
  presupuesto: number;
  gastado: number;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
}

export const proveedores: Proveedor[] = [
  { id: 'PRV001', nombre: 'TechDistributor RD', email: 'ventas@techdistributor.com', telefono: '809-111-1111', direccion: 'Av. Winston Churchill 555, Santo Domingo', categoria: 'Electrónica', totalOrdenes: 45, avatar: 'https://i.pravatar.cc/150?img=52' },
  { id: 'PRV002', nombre: 'AudioWorld', email: 'contacto@audioworld.com', telefono: '809-222-2222', direccion: 'Calle El Ejecutivo 222, Santiago', categoria: 'Audio', totalOrdenes: 28, avatar: 'https://i.pravatar.cc/150?img=53' },
  { id: 'PRV003', nombre: 'Suministros OfficePro', email: 'pedidos@officepro.com', telefono: '809-333-3333', direccion: 'Av. Rafael Alarg 888, La Romana', categoria: 'Oficina', totalOrdenes: 62, avatar: 'https://i.pravatar.cc/150?img=54' },
  { id: 'PRV004', nombre: 'DataCloud Solutions', email: 'ventas@datacloud.com', telefono: '809-444-4444', direccion: 'Torre Empresarial, Piso 12, Santo Domingo', categoria: 'Software', totalOrdenes: 15, avatar: 'https://i.pravatar.cc/150?img=55' },
  { id: 'PRV005', nombre: 'Comercializadora Verde', email: 'info@comercializadoraverde.com', telefono: '809-555-5555', direccion: 'Carretera Mella km 8, Santo Domingo', categoria: 'Suministros', totalOrdenes: 33, avatar: 'https://i.pravatar.cc/150?img=56' },
];

export const transaccionesContables: TransaccionContable[] = [
  { id: 'CNT001', descripcion: 'Venta de productos tecnológicos', tipo: 'ingreso', monto: 125000, fecha: '2026-04-28', categoria: 'Ventas', estado: 'conciliada' },
  { id: 'CNT002', descripcion: 'Pago a proveedor TechDistributor', tipo: 'egreso', monto: 45000, fecha: '2026-04-27', categoria: 'Proveedores', estado: 'conciliada' },
  { id: 'CNT003', descripcion: 'Servicios de hosting mensual', tipo: 'egreso', monto: 2500, fecha: '2026-04-26', categoria: 'Servicios', estado: 'pendiente' },
  { id: 'CNT004', descripcion: 'Venta de licencias de software', tipo: 'ingreso', monto: 35000, fecha: '2026-04-25', categoria: 'Software', estado: 'conciliada' },
  { id: 'CNT005', descripcion: 'Mantenimiento de equipos', tipo: 'egreso', monto: 8500, fecha: '2026-04-24', categoria: 'Mantenimiento', estado: 'conciliada' },
  { id: 'CNT006', descripcion: 'Pago de alquiler de oficina', tipo: 'egreso', monto: 15000, fecha: '2026-04-23', categoria: 'Alquiler', estado: 'conciliada' },
];

export const empleados: Empleado[] = [
  { id: 'EMP001', nombre: 'Laura Martínez', cargo: 'Gerente de Ventas', departamento: 'Ventas', email: 'laura@volterp.com', telefono: '809-777-0001', fechaIngreso: '2023-01-15', salario: 85000, avatar: 'https://i.pravatar.cc/150?img=1', estado: 'activo' },
  { id: 'EMP002', nombre: 'Miguel Torres', cargo: 'Desarrollador FullStack', departamento: 'TI', email: 'miguel@volterp.com', telefono: '809-777-0002', fechaIngreso: '2023-03-20', salario: 95000, avatar: 'https://i.pravatar.cc/150?img=2', estado: 'activo' },
  { id: 'EMP003', nombre: 'Sandra Peña', cargo: 'Contadora', departamento: 'Contabilidad', email: 'sandra@volterp.com', telefono: '809-777-0003', fechaIngreso: '2022-08-10', salario: 75000, avatar: 'https://i.pravatar.cc/150?img=5', estado: 'activo' },
  { id: 'EMP004', nombre: 'Carlos Ruiz', cargo: 'Analista de Recursos Humanos', departamento: 'RRHH', email: 'carlos@volterp.com', telefono: '809-777-0004', fechaIngreso: '2024-02-01', salario: 65000, avatar: 'https://i.pravatar.cc/150?img=12', estado: 'activo' },
  { id: 'EMP005', nombre: 'Ana López', cargo: 'Asistente de Dirección', departamento: 'Administración', email: 'ana@volterp.com', telefono: '809-777-0005', fechaIngreso: '2024-06-15', salario: 45000, avatar: 'https://i.pravatar.cc/150?img=9', estado: 'inactivo' },
];

export const proyectos: Proyecto[] = [
  { id: 'PRY001', nombre: 'Sistema de Inventario v2.0', cliente: 'Tech Solutions RD', estado: 'en_progreso', presupuesto: 250000, gastado: 145000, fechaInicio: '2026-01-15', fechaFin: '2026-06-30', progreso: 58 },
  { id: 'PRY002', nombre: 'Portal de Clientes Premium', cliente: 'Inversiones García', estado: 'en_progreso', presupuesto: 180000, gastado: 95000, fechaInicio: '2026-02-01', fechaFin: '2026-05-15', progreso: 53 },
  { id: 'PRY003', nombre: 'Migración a la nube', cliente: 'López & Asocs', estado: 'pendiente', presupuesto: 320000, gastado: 0, fechaInicio: '2026-05-01', fechaFin: '2026-08-30', progreso: 0 },
  { id: 'PRY004', nombre: 'App móvil de ventas', cliente: 'Tech Solutions RD', estado: 'completado', presupuesto: 150000, gastado: 148000, fechaInicio: '2025-11-01', fechaFin: '2026-03-15', progreso: 100 },
  { id: 'PRY005', nombre: 'Automatización de procesos', cliente: 'Inversiones García', estado: 'completado', presupuesto: 85000, gastado: 82000, fechaInicio: '2025-09-01', fechaFin: '2025-12-20', progreso: 100 },
];