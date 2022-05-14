import { NbButton, NbCard, NbCardBody, NbFormField, NbFormFieldAddon, NbIcon, NbInput } from '@nebular-react';
import { useState } from 'react';

export function FormFieldPassword() {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <NbCard size="small">
      <NbCardBody>
        <NbFormField>
          <NbInput type={showPassword ? 'text' : 'password'} />
          <NbFormFieldAddon type="suffix">
            <NbButton appearance="ghost" onClick={toggleShowPassword}>
              <NbIcon
                icon={showPassword ? 'eye-outline' : 'eye-off-2-outline'}
                pack="eva"
                aria-label={showPassword ? 'hide password' : 'show password'}
              />
            </NbButton>
          </NbFormFieldAddon>
        </NbFormField>
      </NbCardBody>
    </NbCard>
  );
}
