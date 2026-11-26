import React from 'react';
import { Barcode } from './Barcode';

export default { title: 'Barcode', component: Barcode };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Barcode value="5901234123457" ariaLabel="EAN-13 do produto" />
      <Barcode value="96385074" format="EAN8" ariaLabel="EAN-8 do produto" />
      <Barcode value="Nebular 42" format="CODE128" ariaLabel="Código Code 128" />
      <Barcode value="ABC-123" format="CODE39" ariaLabel="Código Code 39" />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1.5rem' }}>
      <Barcode value="5901234123457" width={160} height={56} ariaLabel="Código pequeno" />
      <Barcode value="5901234123457" ariaLabel="Código padrão" />
      <Barcode value="5901234123457" width={360} height={120} ariaLabel="Código grande" />
    </div>
  );
}

export function Colors() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1.5rem' }}>
      <Barcode
        value="5901234123457"
        color="#3366ff"
        backgroundColor="#f7f9fc"
        ariaLabel="Código azul"
      />
      <Barcode
        value="96385074"
        format="EAN8"
        color="#222b45"
        backgroundColor="#ffe7a3"
        ariaLabel="Código com fundo amarelo"
      />
      <Barcode value="Nebular 42" format="CODE128" showValue={false} ariaLabel="Sem valor" />
    </div>
  );
}
