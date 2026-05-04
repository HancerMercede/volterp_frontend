import { useTranslation } from 'react-i18next';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useAsistenciaStore } from '../../stores/asistenciaStore';
import styles from './AsistenciaComponents.module.css';

const COLORS = {
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  gray: '#9CA3AF',
  grid: '#F3F4F6',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}{entry.unit || ''}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AsistenciaDashboard() {
  const { t } = useTranslation();
  const { getAsistenciaSemanal, getTardanzasPorMes, getHorasExtrasPorSemana } = useAsistenciaStore();

  const asistenciaSemanal = getAsistenciaSemanal();
  const tardanzasMes = getTardanzasPorMes();
  const horasExtras = getHorasExtrasPorSemana();

  const distribucionData = [
    { name: t('asistencia.onTime'), value: 80, color: COLORS.success },
    { name: t('asistencia.late'), value: 15, color: COLORS.warning },
    { name: t('asistencia.absent'), value: 5, color: COLORS.danger },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('asistencia.weeklyAttendance')}</h3>
            <span className={styles.chartBadge}>Esta semana</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={asistenciaSemanal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis 
                dataKey="dia" 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                domain={[0, 100]}
                unit="%"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="porcentaje" 
                stroke={COLORS.success}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAttendance)"
                dot={{ fill: COLORS.success, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: COLORS.success, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('asistencia.lateTrend')}</h3>
            <span className={styles.chartBadge}>Último mes</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tardanzasMes.slice(-14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis 
                dataKey="dia" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="tardanzas" 
                stroke={COLORS.warning}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLate)"
                dot={false}
                activeDot={{ r: 5, fill: COLORS.warning, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('asistencia.hoursDistribution')}</h3>
            <span className={styles.chartBadge}>Por semana</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={horasExtras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis 
                dataKey="semana" 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                unit="h"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar 
                dataKey="regulares" 
                name={t('asistencia.regularHours')} 
                fill={COLORS.primary} 
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar 
                dataKey="extras" 
                name={t('asistencia.overtimeHours')} 
                fill={COLORS.secondary} 
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('asistencia.attendanceDistribution')}</h3>
          </div>
          <div className={styles.donutContainer}>
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={distribucionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {distribucionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutLegend}>
              {distribucionData.map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <div 
                    className={styles.legendDot} 
                    style={{ 
                      background: item.color,
                      boxShadow: `0 2px 4px ${item.color}40`
                    }} 
                  />
                  <span className={styles.legendLabel}>{item.name}</span>
                  <strong className={styles.legendValue}>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}