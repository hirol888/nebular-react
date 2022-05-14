import classNames from 'classnames';
import React, { Children, isValidElement, useState } from 'react';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';
import { NbInput } from '../input';
import { NbSelect } from '../select';
import { NbFormFieldAddon } from './FormFieldAddon';
import './form-field.scoped.scss';
import { FormFieldContext } from './form-field-model';

const NbFormField: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children }) => {
  const [formFieldSize, setFormFieldSize] = useState<NbComponentSize>('medium');
  const [formFieldStatus, setFormFieldStatus] = useState<NbComponentOrCustomStatus>('basic');
  const [formFieldFullWidth, setFormFieldFullWidth] = useState<boolean>(false);
  const [formFieldDisabled, setFormFieldDisabled] = useState<boolean>(false);
  const [formFieldFocused, setFormFieldFocused] = useState<boolean>(false);

  const handleSizeChange = (size: NbComponentSize) => {
    setFormFieldSize(size);
  };

  const handleFullWidthChange = (fullWidth: boolean) => {
    setFormFieldFullWidth(fullWidth);
  };

  const handleStatusChange = (status: NbComponentOrCustomStatus) => {
    setFormFieldStatus(status);
  };

  const handleDisableChange = (disabled: boolean) => {
    setFormFieldDisabled(disabled);
  };

  const handleFocusChange = (focused: boolean) => {
    setFormFieldFocused(focused);
  };

  const formControl = Children.map(children, (child) => {
    if (isValidElement(child) && (child.type === NbInput || child.type === NbSelect)) {
      return React.cloneElement(child, {
        ...child.props,
        onSizeChange: handleSizeChange,
        onFullWidthChange: handleFullWidthChange,
        onStatusChange: handleStatusChange,
        onDisableChange: handleDisableChange,
        onFocusChange: handleFocusChange
      });
    }
    return null;
  });
  const prefixAddon = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === NbFormFieldAddon && child.props.type === 'prefix'
  );
  const suffixAddon = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === NbFormFieldAddon && child.props.type === 'suffix'
  );

  return (
    <FormFieldContext.Provider value={{ formFieldSize, formFieldDisabled, formFieldFocused, formFieldStatus }}>
      <div
        className={classNames('nb-form-field', `nb-form-field-size-${formFieldSize}`, {
          'nb-form-field-limited-width': !formFieldFullWidth
        })}
      >
        {prefixAddon && <>{prefixAddon}</>}
        {formControl && (
          <div
            className={classNames('nb-form-control-container', {
              'nb-form-field-control-with-prefix': prefixAddon,
              'nb-form-field-control-with-suffix': suffixAddon
            })}
          >
            {formControl}
          </div>
        )}
        {suffixAddon && <>{suffixAddon}</>}
      </div>
    </FormFieldContext.Provider>
  );
};

export { NbFormField };
