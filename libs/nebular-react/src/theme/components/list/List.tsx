import './list.scoped.scss';

const NbList: React.FC = ({ children }) => {
  return (
    <div className="nb-list" role="list">
      {children}
    </div>
  );
};

export { NbList };
