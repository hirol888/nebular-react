import { NbCard, NbCardBody, NbSpinner } from '@nebular-react';
import { useRef } from 'react';
import './spinner-colors.scoped.scss';

export function SpinnerColors() {
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRef3 = useRef<HTMLDivElement>(null);
  const cardRef4 = useRef<HTMLDivElement>(null);
  const cardRef5 = useRef<HTMLDivElement>(null);
  const cardRef6 = useRef<HTMLDivElement>(null);
  const cardRef7 = useRef<HTMLDivElement>(null);

  return (
    <>
      <NbCard ref={cardRef1}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef1} isLoading={true} status="basic"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef2}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef2} isLoading={true} status="primary"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef3}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef3} isLoading={true} status="warning"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef4}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef4} isLoading={true} status="danger"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef5}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef5} isLoading={true} status="success"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef6}>
        <NbCardBody>Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef6} isLoading={true} status="info"></NbSpinner>
      </NbCard>
      <NbCard ref={cardRef7}>
        <NbCardBody className="control-status-example">Some card content.</NbCardBody>
        <NbSpinner spinnerContainerRef={cardRef7} isLoading={true} status="control"></NbSpinner>
      </NbCard>
    </>
  );
}
