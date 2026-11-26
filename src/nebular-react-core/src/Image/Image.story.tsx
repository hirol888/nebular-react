import React from 'react';
import { Image } from './Image';

export default { title: 'Image', component: Image };

const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="%23e4e9f2"/><circle cx="240" cy="160" r="96" fill="%233366ff"/></svg>';

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
      <Image src={SAMPLE_IMAGE} alt="Nebulosa" radius={12} />
      <Image
        src={SAMPLE_IMAGE}
        alt="Nebulosa com legenda"
        radius={12}
        caption="Nebulosa de Carina"
      />
    </div>
  );
}

export function WithFallback() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Image
        src="/images/does-not-exist.png"
        fallbackSrc={SAMPLE_IMAGE}
        alt="Imagem com origem de fallback"
        radius={12}
        caption="A origem principal falha e o fallback é exibido"
      />
    </div>
  );
}

export function Fit() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
      <Image src={SAMPLE_IMAGE} alt="Cobrindo o contêiner" fit="cover" radius={8} />
      <Image src={SAMPLE_IMAGE} alt="Contido no contêiner" fit="contain" radius={8} />
      <Image src={SAMPLE_IMAGE} alt="Preenchendo o contêiner" fit="fill" radius={8} />
    </div>
  );
}
