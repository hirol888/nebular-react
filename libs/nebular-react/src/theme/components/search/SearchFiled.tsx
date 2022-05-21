import classNames from 'classnames';
import { NbButton } from '../button';
import { NbIcon } from '../icon';
import './styles/search.modal-zoomin.scss';
import './styles/search.layout-rotate.scss';
import './styles/search.modal-move.scss';
import './styles/search.curtain.scss';
import './styles/search.column-curtain.scss';
import './styles/search.modal-drop.scss';
import './styles/search.modal-half.scss';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { ENTER, ESCAPE } from 'libs/nebular-react/src/core/cdk';

export type NbSearchType =
  | 'modal-zoomin'
  | 'rotate-layout'
  | 'modal-move'
  | 'curtain'
  | 'column-curtain'
  | 'modal-drop'
  | 'modal-half';

export type NbSearchFieldProps = {
  type?: NbSearchType;
  placeholder?: string;
  hint?: string;
  show?: boolean;
  onClose?: () => void;
  search?: (term: string) => void;
  onSearchInput?: (value: string | undefined) => void;
};

const NbSearchField: React.FC<NbSearchFieldProps> = ({
  type,
  placeholder,
  hint,
  show = true,
  onClose,
  search,
  onSearchInput
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === ESCAPE) {
      onClose && onClose();
    }
  };

  const handleFormKeyUp = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.keyCode === ENTER && inputRef.current?.value) {
      search && search(inputRef.current.value);
    }
  };

  const handleInput = () => {
    onSearchInput && onSearchInput(inputRef.current?.value);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  return (
    <div
      className={classNames('nb-search-field', {
        show: show,
        'modal-zoomin': type === 'modal-zoomin',
        'rotate-layout': type === 'rotate-layout',
        'modal-move': type === 'modal-move',
        curtain: type === 'curtain',
        'column-curtain': type === 'column-curtain',
        'modal-drop': type === 'modal-drop',
        'modal-half': type === 'modal-half'
      })}
    >
      <div className="search" onKeyUp={(event) => handleSearchKeyUp(event)}>
        <NbButton appearance="ghost" className="close-button" onClick={() => onClose && onClose()}>
          <NbIcon icon="close-outline" pack="nebular-essentials"></NbIcon>
        </NbButton>
        <div className="form-wrapper">
          <form
            className="form"
            onKeyUp={(event) => handleFormKeyUp(event)}
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="form-content">
              <input
                className="search-input"
                ref={inputRef}
                onInput={handleInput}
                autoComplete="off"
                placeholder={placeholder}
                tabIndex={-1}
                onBlur={focusInput}
              />
            </div>
            <span className="info">{hint}</span>
          </form>
        </div>
      </div>
    </div>
  );
};

export { NbSearchField };
