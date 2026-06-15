import clsx from 'clsx';
import Card from './Card';

const tones = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/15 text-amber-700 dark:text-amber-300',
};

const StatCard = ({ icon: Icon, label, value, helper, tone = 'brand' }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{value}</p>
      </div>
      {Icon ? (
        <div className={clsx('rounded-md p-2.5', tones[tone])}>
          <Icon aria-hidden="true" size={20} />
        </div>
      ) : null}
    </div>
    {helper ? <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">{helper}</p> : null}
  </Card>
);

export default StatCard;
