import React, { useState } from 'react';
import { ImageCrop, ImageCropper } from './ImageCropper';

export default { title: 'ImageCropper', component: ImageCropper };

const image = 'https://picsum.photos/seed/nebula-crop/1280/800';

export function Showcase() {
  const [crop, setCrop] = useState<ImageCrop>({ x: 20, y: 20, width: 60, height: 60 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 480 }}>
      <ImageCropper
        src={image}
        alt="Nebula"
        ariaLabel="Nebula cropper"
        value={crop}
        onChange={setCrop}
      />
      <code style={{ fontSize: '0.75rem' }}>
        x: {crop.x}% · y: {crop.y}% · {crop.width}% × {crop.height}%
      </code>
    </div>
  );
}

export function WithAspectRatio() {
  return (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper
        src={image}
        alt="Widescreen nebula"
        ariaLabel="Widescreen cropper"
        aspectRatio={16 / 9}
        height={280}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 480 }}>
      <ImageCropper
        src={image}
        alt="Nebula"
        ariaLabel="Disabled cropper"
        defaultValue={{ x: 10, y: 10, width: 80, height: 80 }}
        disabled
      />
    </div>
  );
}
