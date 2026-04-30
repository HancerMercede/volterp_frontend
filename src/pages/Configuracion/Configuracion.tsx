import { useState } from 'react';
import { PageHeader, Button } from '../../components/UI';
import styles from './Configuracion.module.css';

export function Configuracion() {
  const [empresa, setEmpresa] = useState({
    nombre: 'Mi Empresa',
    rnc: '123-456789-0',
    telefono: '809-123-4567',
    email: 'contacto@miempresa.com',
    direccion: 'Av. Principal 123, Santo Domingo',
  });

  const [config, setConfig] = useState({
   iva: 18,
    moneda: 'DOP',
    zonaHoraria: 'America/Santo_Domingo',
  });

  return (
    <div>
      <PageHeader title="Configuración" />

      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Datos de la Empresa</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Nombre de la Empresa</label>
              <input 
                type="text" 
                value={empresa.nombre}
                onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>RNC</label>
              <input 
                type="text" 
                value={empresa.rnc}
                onChange={(e) => setEmpresa({...empresa, rnc: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Teléfono</label>
              <input 
                type="tel" 
                value={empresa.telefono}
                onChange={(e) => setEmpresa({...empresa, telefono: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={empresa.email}
                onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Dirección</label>
              <input 
                type="text" 
                value={empresa.direccion}
                onChange={(e) => setEmpresa({...empresa, direccion: e.target.value})}
              />
            </div>
            <Button>Guardar Cambios</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Configuración General</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Porcentaje IVA (%)</label>
              <input 
                type="number" 
                value={config.iva}
                onChange={(e) => setConfig({...config, iva: parseInt(e.target.value)})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Moneda</label>
              <select 
                value={config.moneda}
                onChange={(e) => setConfig({...config, moneda: e.target.value})}
              >
                <option value="DOP">Peso Dominicano (DOP)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Zona Horaria</label>
              <select 
                value={config.zonaHoraria}
                onChange={(e) => setConfig({...config, zonaHoraria: e.target.value})}
              >
                <option value="America/Santo_Domingo">Santo Domingo (GMT-4)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>
            <Button>Guardar Configuración</Button>
          </div>
        </div>
      </div>
    </div>
  );
}