import { NbCard, NbCardBody, NbFormField, NbFormFieldAddon, NbIcon, NbInput, NbOption, NbSelect } from '@nebular-react';

export function FormFieldShowcase() {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbFormField>
          <NbFormFieldAddon type="prefix">
            <NbIcon icon="star" pack="eva" />
          </NbFormFieldAddon>
          <NbInput type="text" />
          <NbFormFieldAddon type="suffix">
            <NbIcon icon="star" pack="eva" />
          </NbFormFieldAddon>
        </NbFormField>

        <NbFormField>
          <NbFormFieldAddon type="prefix">
            <NbIcon icon="star" pack="eva" />
          </NbFormFieldAddon>
          <NbSelect>
            <NbOption title="1" value={1} />
          </NbSelect>
        </NbFormField>
      </NbCardBody>
    </NbCard>
  );
}
