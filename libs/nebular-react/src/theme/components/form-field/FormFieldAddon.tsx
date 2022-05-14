import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { FormFieldContext, NbFormAddonType } from './form-field-model';

export type NbFormFieldAddonProps = {
  type: NbFormAddonType;
};

const NbFormFieldAddon: React.FC<NbFormFieldAddonProps & React.HTMLAttributes<HTMLDivElement>> = ({
  type,
  children,
  ...otherProps
}) => {
  const [classes, setClasses] = useState<string[]>([]);
  const { formFieldSize, formFieldStatus, formFieldDisabled, formFieldFocused } = useContext(FormFieldContext);

  const getAddonClasses = () => {
    const classes: string[] = ['nb-form-field-addon', `nb-form-field-${type}-${formFieldSize}`];

    if (formFieldDisabled) {
      classes.push('nb-form-field-addon-disabled');
    } else if (formFieldFocused) {
      classes.push(`nb-form-field-addon-${formFieldStatus}-highlight`);
    } else {
      classes.push(`nb-form-field-addon-${formFieldStatus}`);
    }

    return classes;
  };

  useEffect(() => {
    setClasses(getAddonClasses());
  }, [formFieldDisabled, formFieldFocused, formFieldSize, formFieldStatus]);

  return (
    <div className={classNames(classes)} {...otherProps}>
      {children}
    </div>
  );
};

export { NbFormFieldAddon };
