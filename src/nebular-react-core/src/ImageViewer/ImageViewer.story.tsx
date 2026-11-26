import React, { useState } from 'react';
import { Button } from '../Button';
import { ImageViewer } from './ImageViewer';

export default { title: 'ImageViewer', component: ImageViewer };

const image = 'https://picsum.photos/seed/nebula/1280/800';

export function Showcase() {
  return (
    <ImageViewer
      src={image}
      alt="Nebula"
      withDownload
      downloadFileName="nebula.jpg"
      style={{ maxWidth: 360 }}
    />
  );
}

export function WithCaption() {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <>
      <Button status="primary" onClick={() => setOpened(true)}>
        Open image viewer
      </Button>
      <ImageViewer
        src={image}
        alt="Nebula in Carina"
        caption="The Carina Nebula, captured by the James Webb Space Telescope."
        withDownload
        downloadFileName="nebula-in-carina.jpg"
        opened={opened}
        onOpenChange={setOpened}
        onClose={() => setOpened(false)}
      />
    </>
  );
}
