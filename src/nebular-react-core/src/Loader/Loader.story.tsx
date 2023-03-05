import React, { useRef, useState } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Loader } from './Loader';
import { ExampleItemsRows } from '../Shared';
import { Tabset } from '../Tabset';
import './CustomLoader.css';

export default { title: 'Loader' };

export function ButtonLoader() {
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
    <Card>
      <Card.Body>
        <ExampleItemsRows>
          <Button ref={buttonRef1} onClick={toggleIsLoading} disabled={isLoading}>
            Download
          </Button>
          <Loader loaderContainerRef={buttonRef1} isLoading={isLoading} status="success" />
          <Button ref={buttonRef2} onClick={toggleIsLoading} disabled={isLoading}>
            Download
          </Button>
          <Loader loaderContainerRef={buttonRef2} isLoading={isLoading} status="warning" />
          <Button ref={buttonRef3} onClick={toggleIsLoading} disabled={isLoading}>
            Download
          </Button>
          <Loader loaderContainerRef={buttonRef3} isLoading={isLoading} status="danger" />
          <Button ref={buttonRef4} onClick={toggleIsLoading} disabled={isLoading}>
            Download
          </Button>
          <Loader loaderContainerRef={buttonRef4} isLoading={isLoading} status="info" />
        </ExampleItemsRows>
      </Card.Body>
    </Card>
  );
}

export function CardLoader() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleIsLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <Card accent="danger" size="tiny" ref={cardRef}>
      <Card.Header>Loaders</Card.Header>
      <Card.Body>
        <p>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object.
        </p>
        <Button status="info" size="small" onClick={toggleIsLoading}>
          Reload
        </Button>
      </Card.Body>
      <Loader loaderContainerRef={cardRef} isLoading={isLoading} status="danger" size="large" />
    </Card>
  );
}

export function TabLoader() {
  const [isLoading1, setIsLoading1] = useState<boolean>(false);
  const [isLoading2, setIsLoading2] = useState<boolean>(false);
  const tabRef1 = useRef<HTMLDivElement>(null);
  const tabRef2 = useRef<HTMLDivElement>(null);

  const toggleLoading = (tabIndex: number) => {
    if (tabIndex === 0) {
      setTimeout(() => setIsLoading1(false), 1000);
      setIsLoading1(true);
    }
    if (tabIndex === 1) {
      setTimeout(() => setIsLoading2(false), 1000);
      setIsLoading2(true);
    }
  };

  return (
    <>
      <Tabset fullWidth onTabChange={toggleLoading}>
        <Tabset.Tab title="Tab 1" ref={tabRef1} style={{ padding: '1.25rem' }}>
          <p>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object.
          </p>
        </Tabset.Tab>
        <Tabset.Tab title="Tab 2" ref={tabRef2} style={{ padding: '1.25rem' }}>
          <p>
            Nebular&quot;s primary goal is to assemble together and connect the most awesome
            features and libraries creating an efficient ecosystem to speed up and simplify the
            development.
          </p>
        </Tabset.Tab>
      </Tabset>
      <Loader loaderContainerRef={tabRef1} status="success" size="giant" isLoading={isLoading1} />
      <Loader loaderContainerRef={tabRef2} status="info" size="giant" isLoading={isLoading2} />
    </>
  );
}

export function Color() {
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRef3 = useRef<HTMLDivElement>(null);
  const cardRef4 = useRef<HTMLDivElement>(null);
  const cardRef5 = useRef<HTMLDivElement>(null);
  const cardRef6 = useRef<HTMLDivElement>(null);

  return (
    <>
      <Card ref={cardRef1}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef1} isLoading status="basic" />
      </Card>
      <Card ref={cardRef2}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef2} isLoading status="primary" />
      </Card>
      <Card ref={cardRef3}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef3} isLoading status="warning" />
      </Card>
      <Card ref={cardRef4}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef4} isLoading status="danger" />
      </Card>
      <Card ref={cardRef5}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef5} isLoading status="success" />
      </Card>
      <Card ref={cardRef6}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef6} isLoading status="info" />
      </Card>
    </>
  );
}

export function Size() {
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
  const cardRef3 = useRef<HTMLDivElement>(null);
  const cardRef4 = useRef<HTMLDivElement>(null);
  const cardRef5 = useRef<HTMLDivElement>(null);

  return (
    <>
      <Card ref={cardRef1}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef1} isLoading status="primary" size="tiny" />
      </Card>
      <Card ref={cardRef2}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef2} isLoading status="primary" size="small" />
      </Card>
      <Card ref={cardRef3}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef3} isLoading status="primary" size="medium" />
      </Card>
      <Card ref={cardRef4}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef4} isLoading status="primary" size="large" />
      </Card>
      <Card ref={cardRef5}>
        <Card.Body>Some card content.</Card.Body>
        <Loader loaderContainerRef={cardRef5} isLoading status="primary" size="giant" />
      </Card>
    </>
  );
}

export function Message() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const buttonRef1 = useRef<HTMLButtonElement>(null);

  const toggleIsLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <>
      <Button ref={buttonRef1} onClick={toggleIsLoading} disabled={isLoading}>
        Download
      </Button>
      <Loader
        loaderContainerRef={buttonRef1}
        isLoading={isLoading}
        status="success"
        message="Loading..."
      />
    </>
  );
}

export function CustomLoader() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const buttonRef1 = useRef<HTMLButtonElement>(null);

  const toggleIsLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <>
      <Button ref={buttonRef1} onClick={toggleIsLoading} disabled={isLoading}>
        Download
      </Button>
      <Loader
        loaderContainerRef={buttonRef1}
        isLoading={isLoading}
        customLoader={
          <div className="spinner">
            <div className="bounce1" />
            <div className="bounce2" />
            <div className="bounce3" />
          </div>
        }
      />
    </>
  );
}
