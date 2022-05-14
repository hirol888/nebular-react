import { NbCard, NbCardBody, NbFormField, NbFormFieldAddon, NbIcon, NbInput } from '@nebular-react';

export function FormFieldInput() {
  return (
    <NbCard size="small">
      <NbCardBody>
        <NbFormField>
          <NbFormFieldAddon type="prefix">
            <NbIcon icon="at-outline" pack="eva" />
          </NbFormFieldAddon>
          <NbInput type="text" />
        </NbFormField>
      </NbCardBody>
    </NbCard>
  );
}
