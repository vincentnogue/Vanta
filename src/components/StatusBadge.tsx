import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import type { TransferStatus } from '@/data/mockData';
import { Check, Clock, Loader, X, Shield } from 'lucide-react';

export function StatusBadge({ status }: { status: TransferStatus }) {
  const { t } = useI18n();

  const config: Record<TransferStatus, { color: string; icon: typeof Check; label: TranslationKey }> = {
    completed: { color: 'bg-success-50 text-success-700', icon: Check, label: 'status.completed' },
    pending: { color: 'bg-warning-50 text-warning-600', icon: Clock, label: 'status.pending' },
    processing: { color: 'bg-vanta-50 text-vanta-700', icon: Loader, label: 'status.processing' },
    failed: { color: 'bg-danger-50 text-danger-700', icon: X, label: 'status.failed' },
    cancelled: { color: 'bg-ink-100 text-ink-500', icon: X, label: 'status.cancelled' },
    review: { color: 'bg-warning-50 text-warning-600', icon: Shield, label: 'status.review' },
  };

  const { color, icon: Icon, label } = config[status];

  return (
    <span className={`badge ${color} whitespace-nowrap`}>
      <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {t(label)}
    </span>
  );
}
