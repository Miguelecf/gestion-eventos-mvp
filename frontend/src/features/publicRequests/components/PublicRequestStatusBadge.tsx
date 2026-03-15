import { Badge } from '@/components/ui/badge';
import {
  getRequestStatusBadgeVariant,
  getRequestStatusColor,
  getRequestStatusDescription,
  getRequestStatusLabel,
  type PublicRequestStatus,
} from '@/models/public-request';

interface PublicRequestStatusBadgeProps {
  status: PublicRequestStatus;
  className?: string;
}

export function PublicRequestStatusBadge({
  status,
  className,
}: PublicRequestStatusBadgeProps) {
  return (
    <Badge
      variant={getRequestStatusBadgeVariant(status)}
      className={[getRequestStatusColor(status), className].filter(Boolean).join(' ')}
      title={getRequestStatusDescription(status)}
    >
      {getRequestStatusLabel(status)}
    </Badge>
  );
}
