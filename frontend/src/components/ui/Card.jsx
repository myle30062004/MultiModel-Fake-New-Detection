import clsx from 'clsx';

const Card = ({ as: Component = 'section', className, children, ...props }) => (
  <Component className={clsx('surface', className)} {...props}>
    {children}
  </Component>
);

export default Card;
