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