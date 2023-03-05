import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Tabset } from './Tabset';
import { Loader } from '../Loader';

export default { title: 'Tabset' };

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <Tabset>
          <Tabset.Tab title="Users">
            <p>
              List of <strong>users</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab title="Orders">
            <p>
              List of <strong>orders</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab title="Transactions" disabled>
            <p>
              List of <strong>transactions</strong>
            </p>
          </Tabset.Tab>
        </Tabset>
      </Card.Body>
    </Card>
  );
}

export function TabBadge() {
  return (
    <Card>
      <Card.Body>
        <Tabset>
          <Tabset.Tab title="Users" badge={<Badge text="99+" status="danger" />}>
            <p>
              List of <strong>users</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab
            title="Orders"
            badge={<Badge text="12" position="bottom right" status="warning" />}
          >
            <p>
              List of <strong>orders</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab
            title="Transactions"
            badge={<Badge text="new" position="top right" status="success" />}
          >
            <p>
              List of <strong>transactions</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab
            title="Notifications"
            badge={<Badge dotMode position="center start" status="danger" />}
          >
            <p>
              List of <strong>notifications</strong>
            </p>
          </Tabset.Tab>
        </Tabset>
      </Card.Body>
    </Card>
  );
}

export function TabIcon() {
  return (
    <>
      <Card>
        <Card.Body>
          <Tabset>
            <Tabset.Tab icon={<Icon icon="person-outline" />}>
              <p>
                List of <strong>users</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab icon={<Icon icon="bell-outline" pack="eva" />}>
              <p>
                List of <strong>orders</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab icon={<Icon icon="email-outline" />}>
              <p>
                List of <strong>transactions</strong>
              </p>
            </Tabset.Tab>
          </Tabset>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tabset fullWidth>
            <Tabset.Tab icon={<Icon icon="person-outline" />}>
              <p>
                List of <strong>users</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab icon={<Icon icon="bell-outline" pack="eva" />}>
              <p>
                List of <strong>orders</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab icon={<Icon icon="email-outline" />}>
              <p>
                List of <strong>transactions</strong>
              </p>
            </Tabset.Tab>
          </Tabset>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tabset>
            <Tabset.Tab title="Users" icon={<Icon icon="person-outline" />} responsive>
              <p>
                List of <strong>users</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab title="Orders" icon={<Icon icon="bell-outline" pack="eva" />} responsive>
              <p>
                List of <strong>orders</strong>
              </p>
            </Tabset.Tab>
            <Tabset.Tab title="Transactions" icon={<Icon icon="email-outline" />} responsive>
              <p>
                List of <strong>transactions</strong>
              </p>
            </Tabset.Tab>
          </Tabset>
        </Card.Body>
      </Card>
    </>
  );
}

export function TabTitle() {
  return (
    <Card>
      <Card.Body>
        <Tabset activeTabIndex={1}>
          <Tabset.Tab>
            <Tabset.Title>
              <span style={{ color: 'red' }}>Orders</span>
            </Tabset.Title>
            <p>
              List of <strong>orders</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab>
            <Tabset.Title>
              <span style={{ color: 'red' }}>Transactions</span>
            </Tabset.Title>
            <p>
              List of <strong>transactions</strong>
            </p>
          </Tabset.Tab>
        </Tabset>
      </Card.Body>
    </Card>
  );
}

export function LazyLoad() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const Tab2 = ({ loaderContainerRef }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
      setTimeout(() => setIsLoading(false), 3000);
    }, []);

    return (
      <>
        {!isLoading && <p>Tab2 content</p>}
        <Loader
          loaderContainerRef={loaderContainerRef}
          isLoading={isLoading}
          message="Loading..."
        />
      </>
    );
  };

  const Tab3 = ({ loaderContainerRef }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
      setTimeout(() => setIsLoading(false), 1500);
    }, []);

    return (
      <>
        {!isLoading && <p>Tab3 content</p>}
        <Loader
          loaderContainerRef={loaderContainerRef}
          isLoading={isLoading}
          message="Loading..."
        />
      </>
    );
  };

  return (
    <Card>
      <Card.Body ref={loaderRef}>
        <Tabset lazyLoad>
          <Tabset.Tab title="Users">
            <p>
              List of <strong>users</strong>
            </p>
          </Tabset.Tab>
          <Tabset.Tab title="Orders">
            <Tab2 loaderContainerRef={loaderRef} />
          </Tabset.Tab>
          <Tabset.Tab title="Transactions">
            <Tab3 loaderContainerRef={loaderRef} />
          </Tabset.Tab>
        </Tabset>
      </Card.Body>
    </Card>
  );
}
