import classNames from 'classnames';
import React from 'react';
import * as _ from 'lodash';
import { ComponentLink } from './components';
import './ComponentsList.scoped.scss';
import { Link } from 'react-router-dom';

interface ComponentsListProps {
  components: ComponentLink[];
  vertical?: boolean;
}

const ComponentsList: React.FC<ComponentsListProps> = (props) => {
  return (
    <div
      className={classNames({
        'component-list-container': true,
        column: props.vertical
      })}
    >
      {props.components.map((c) => {
        return (
          <div className="component-block" key={_.uniqueId('component')}>
            {_.isEmpty(c.component) && <span>{c.path}</span>}
            {!_.isEmpty(c.component) && (
              <Link to={c.link ?? ''} className="component-link">
                {c.name}
              </Link>
            )}
            {c.children && (
              <ComponentsList
                vertical={true}
                components={c.children}
              ></ComponentsList>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { ComponentsList };
