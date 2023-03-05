import React from 'react';
import { Card } from '../Card';
import { User } from './User';

export default { title: 'User' };

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <User
          size="large"
          name="John Doe"
          title="Engineer"
          badgeText="99+"
          badgeStatus="success"
          badgePosition="bottom right"
        />
      </Card.Body>
    </Card>
  );
}

export function Avatar() {
  const base64Image =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAG1BMVEVEeef///+4zPaKq/ChvPPn7' +
    'vxymu3Q3flbieqI1HvuAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAQUlEQVQ4jWNgGAWjgP6ASdncAEaiAhaGiACmFhCJLsMaIiDAEQEi0WXYEiMC' +
    'OCJAJIY9KuYGTC0gknpuHwXDGwAA5fsIZw0iYWYAAAAASUVORK5CYII=';

  return (
    <>
      <Card>
        <Card.Body>
          <p>User avatar image set as link</p>
          <User
            size="large"
            name="John Doe"
            title="Engineer"
            picture="https://via.placeholder.com/50/4479e7/ffffff?Text=IMG"
          />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>User avatar image set as BASE64 string</p>
          <User size="large" name="John Doe" title="Engineer" picture={base64Image} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>User avatar image not set and showInitials disabled</p>
          <User size="large" name="John Doe" title="Engineer" showInitials={false} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>User avatar with custom background color</p>
          <User size="large" name="John Doe" title="Engineer" color="#cccccc" />
        </Card.Body>
      </Card>
    </>
  );
}

export function HideCaptions() {
  return (
    <>
      <Card>
        <Card.Body>
          <p>Only pictures</p>
          <User size="large" name="John Doe" title="Engineer" showName={false} showTitle={false} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>Name hidden</p>
          <User size="large" name="John Doe" title="Engineer" showName={false} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>Title hidden</p>
          <User size="large" name="John Doe" title="Engineer" showTitle={false} />
        </Card.Body>
      </Card>
    </>
  );
}

export function Shape() {
  return (
    <>
      <Card>
        <Card.Body>
          <p>Rectangle</p>
          <User shape="rectangle" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>Semi-round</p>
          <User shape="semiround" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>Round</p>
          <User shape="round" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
    </>
  );
}

export function Size() {
  return (
    <>
      <Card>
        <Card.Body>
          <User size="tiny" name="John Doe" title="Engineer" showTitle={false} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <User size="small" name="John Doe" title="Engineer" showTitle={false} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <User size="medium" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <User size="large" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <User size="giant" name="John Doe" title="Engineer" />
        </Card.Body>
      </Card>
    </>
  );
}
