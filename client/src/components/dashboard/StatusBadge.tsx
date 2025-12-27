import { MaintenanceRequest } from '@/lib/dummyData';

function stageStyles(stage: MaintenanceRequest['stage']): string {
  // Theme mapping per theme.txt
  switch (stage) {
    case 'new':
      return 'bg-zinc-800 text-zinc-100 border border-zinc-700';
    case 'in_progress':
      return 'bg-amber-900/30 text-amber-200 border border-amber-700/50';
    case 'repaired':
      return 'bg-emerald-900/30 text-emerald-200 border border-emerald-700/50';
    case 'scrap':
      return 'bg-zinc-900 text-zinc-400 border border-zinc-700';
    default:
      return 'bg-zinc-800 text-zinc-100 border border-zinc-700';
  }
}

export default function StatusBadge({ stage }: { stage: MaintenanceRequest['stage'] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${stageStyles(stage)}`}>
      {stage.replace('_', ' ')}
    </span>
  );
}
