import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/models/event';

interface EventOriginCardProps {
  event: Event;
  canNavigateToRequest: boolean;
  onNavigateToRequest?: (requestId: number) => void;
}

export function EventOriginCard({
  event,
  canNavigateToRequest,
  onNavigateToRequest,
}: EventOriginCardProps) {
  const isFromPublicRequest = event.originType === 'PUBLIC_REQUEST';
  const hasOriginRequestId = event.originRequestId != null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Origen</CardTitle>
        <CardDescription>Como se genero este evento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isFromPublicRequest ? (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Origen</p>
              <p className="text-sm font-medium">Solicitud publica</p>
            </div>

            {hasOriginRequestId ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Solicitud</p>
                <p className="text-sm">Solicitud #{event.originRequestId}</p>
              </div>
            ) : null}

            {canNavigateToRequest && onNavigateToRequest && hasOriginRequestId ? (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigateToRequest(event.originRequestId!)}
              >
                Ver solicitud
              </Button>
            ) : null}
          </>
        ) : event.originType === 'MANUAL' ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Origen</p>
            <p className="text-sm font-medium">Manual</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Origen</p>
            <p className="text-sm text-muted-foreground">No disponible.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
