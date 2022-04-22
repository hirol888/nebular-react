import React from 'react';
import { NbCard, NbCardBody, NbCardHeader, NbLinkButton } from '@nebular-react';

const LinkButtons: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Link Buttons</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbLinkButton to="/" useRoute={true} status="primary">
          Link to root
        </NbLinkButton>
        <NbLinkButton
          href="https://www.google.com"
          target="_blank"
          status="info"
        >
          Google
        </NbLinkButton>
        <NbLinkButton to="/" useRoute={true} status="warning" disabled={true}>
          Link to root disabled
        </NbLinkButton>
        <NbLinkButton
          href="https://www.google.com"
          target="_blank"
          status="danger"
          disabled={true}
        >
          Google disabled
        </NbLinkButton>
      </NbCardBody>
    </NbCard>
  );
};

export { LinkButtons };
