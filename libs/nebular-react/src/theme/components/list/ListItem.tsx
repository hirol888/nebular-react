import './list-item.scoped.scss';

const NbListItem: React.FC = ({ children }) => {
  return (
    <div className="nb-list-item" role="listitem">
      {children}
    </div>
  );
};

export { NbListItem };
