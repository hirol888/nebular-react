import React, { useState } from 'react';
import { ImageComparison } from './ImageComparison';

export default { title: 'ImageComparison', component: ImageComparison };

const landscape = 'https://picsum.photos/id/1018/960/540';
const before = { src: `${landscape}?grayscale`, alt: 'Mountain valley in grayscale' };
const after = { src: landscape, alt: 'Mountain valley in color' };

export function PhotoColorCorrection() {
  return (
    <ImageComparison
      before={before}
      after={after}
      caption="Slide to compare the original image with the color version."
      style={{ maxWidth: '44rem' }}
    />
  );
}

export function ControlledReview() {
  const [position, setPosition] = useState(65);

  return (
    <div style={{ maxWidth: '32rem' }}>
      <ImageComparison
        before={before}
        after={after}
        fit="contain"
        value={position}
        onChange={setPosition}
        labels={{ before: 'Original', after: 'Color correction', comparison: 'Reveal original' }}
      />
      <p>Original image visible: {position}%</p>
    </div>
  );
}
