import classNames from 'classnames';

export interface LayoutHeaderProps {
  fixed?: boolean;
  subheader?: boolean;
}

const NbLayoutHeader: React.FC<
  LayoutHeaderProps & React.HTMLAttributes<HTMLDivElement>
> = ({ fixed, subheader, className, children, ...otherProps }) => {
  const _fixed = subheader ? false : fixed;

  return (
    <div
      className={classNames('nb-layout-header', className, {
        fixed: _fixed
      })}
      {...otherProps}
    >
      <nav
        className={classNames({
          fixed: _fixed,
          subheader: subheader
        })}
      >
        {children}
      </nav>
    </div>
  );
};

export { NbLayoutHeader };
