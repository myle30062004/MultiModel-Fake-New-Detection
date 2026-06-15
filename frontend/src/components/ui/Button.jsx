import clsx from 'clsx';

const variants = {
  primary:
    'bg-brand text-white hover:bg-brand-hover disabled:bg-brand/60 dark:shadow-none',
  secondary:
    'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10',
  danger:
    'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/60',
  success:
    'bg-success text-white hover:bg-success/90 disabled:bg-success/60',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

const Button = ({
  as: Component = 'button',
  children,
  className,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) => (
  <Component
    type={Component === 'button' ? type : undefined}
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 ease-out focus-visible:outline-none disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {Icon ? <Icon aria-hidden="true" size={18} strokeWidth={2.2} /> : null}
    {children}
  </Component>
);

export default Button;
