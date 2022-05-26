import { NbButton, NbCard, NbCardBody, NbCardHeader, NbSpinner } from '@nebular-react';
import { useRef, useState } from 'react';

export function SpinnerCard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleIsLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <NbCard accent="danger" size="tiny" ref={cardRef}>
      <NbCardHeader>Spinners</NbCardHeader>
      <NbCardBody>
        <p>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object.
        </p>
        <NbButton status="info" size="small" onClick={toggleIsLoading}>
          Reload
        </NbButton>
      </NbCardBody>
      <NbSpinner spinnerContainerRef={cardRef} isLoading={isLoading} status="danger" size="large"></NbSpinner>
    </NbCard>
  );
}
