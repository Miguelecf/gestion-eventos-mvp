/**
 * ===================================================================
 * COMPONENTE: AlertsPanel
 * ===================================================================
 * Panel principal de alertas operativas del Dashboard
 * Solo se muestra si hay alertas activas
 * ===================================================================
 */

import { useDashboardAlerts } from '../hooks/useDashboardAlerts';
import { AlertCard } from './AlertCard';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AlertsPanel() {
  const alerts = useDashboardAlerts();

  // No mostrar si no hay alertas
  if (alerts.length === 0) {
    return null;
  }

  // Calcular total de alertas
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <Card className="rounded-2xl border-amber-200 bg-amber-50/30 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
          <AlertTriangle className="h-5 w-5" />
          Alertas operativas
          <span className="ml-auto text-sm font-normal">
            ({totalAlerts})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}
