import { NbCard, NbCardBody, NbSpinner } from '@nebular-react';
import { useRef } from 'react';

export function SpinnerSizes() {
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRef3 = useRef<HTMLDivElement>(null);
  const cardRef4 = useRef<HTMLDivElement>(null);
  const cardRef5 = useRef<HTMLDivElement>(null);

  return (
    <>
      <NbCard ref={cardRef1}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef1} isLoading={true} status="primary" size="tiny"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef2}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef2} isLoading={true} status="primary" size="small"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef3}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef3} isLoading={true} status="primary" size="medium"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef4}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef4} isLoading={true} status="primary" size="large"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef5}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef5} isLoading={true} status="primary" size="giant"></NbSpinner>
      </NbCard>
    </>
  );
}
