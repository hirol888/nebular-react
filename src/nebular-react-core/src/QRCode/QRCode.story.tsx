import React from 'react';
import { QRCode } from './QRCode';

export default { title: 'QRCode', component: QRCode };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' }}>
      <QRCode value="https://nebular.dev" ariaLabel="QR code do site do Nebular" />
      <QRCode
        value="https://nebular.dev/docs"
        size={120}
        errorCorrectionLevel="H"
        ariaLabel="QR code da documentação"
      />
      <QRCode value="Nebular" size={96} margin={2} ariaLabel="QR code curto" />
    </div>
  );
}

export function CustomColors() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' }}>
      <QRCode
        value="https://nebular.dev"
        color="#3366ff"
        backgroundColor="#f7f9fc"
        ariaLabel="QR code azul"
      />
      <QRCode
        value="https://nebular.dev"
        color="#222b45"
        backgroundColor="#ffe7a3"
        margin={6}
        ariaLabel="QR code com fundo amarelo"
      />
    </div>
  );
}
