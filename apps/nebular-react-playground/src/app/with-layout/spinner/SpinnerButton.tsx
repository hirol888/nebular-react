import { NbButton, NbCard, NbCardBody, NbSpinner } from '@nebular-react';
import { useRef, useState } from 'react';

export function SpinnerButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const buttonRef1 = useRef<HTMLButtonElement>(null);
  const buttonRef2 = useRef<HTMLButtonElement>(null);
  const buttonRef3 = useRef<HTMLButtonElement>(null);
  const buttonRef4 = useRef<HTMLButtonElement>(null);

  const toggleIsLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbButton ref={buttonRef1} onClick={toggleIsLoading} disabled={isLoading}>
          Download
        </NbButton>
        <NbSpinner spinnerContainerRef={buttonRef1} isLoading={isLoading} status="success"></NbSpinner>
        <NbButton ref={buttonRef2} onClick={toggleIsLoading} disabled={isLoading}>
          Download
        </NbButton>
        <NbSpinner spinnerContainerRef={buttonRef2} isLoading={isLoading} status="warning"></NbSpinner>
        <NbButton ref={buttonRef3} onClick={toggleIsLoading} disabled={isLoading}>
          Download
        </NbButton>
        <NbSpinner spinnerContainerRef={buttonRef3} isLoading={isLoading} status="danger"></NbSpinner>
        <NbButton ref={buttonRef4} onClick={toggleIsLoading} disabled={isLoading}>
          Download
        </NbButton>
        <NbSpinner spinnerContainerRef={buttonRef4} isLoading={isLoading} status="info"></NbSpinner>
      </NbCardBody>
    </NbCard>
  );
}
