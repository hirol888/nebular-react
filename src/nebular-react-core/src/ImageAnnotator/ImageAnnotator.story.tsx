import React, { useState } from 'react';
import { FilePreview } from '../FilePreview';
import { ImageAnnotator } from './ImageAnnotator';
import type { ImageAnnotation } from './ImageAnnotator';

export default { title: 'ImageAnnotator', component: ImageAnnotator };

const valley = 'https://picsum.photos/id/1018/960/540';
const annotations: readonly ImageAnnotation[] = [
  { id: 'trail', kind: 'point', x: 0.61, y: 0.67, comment: 'Trail junction' },
  {
    id: 'ridge',
    kind: 'rectangle',
    x: 0.15,
    y: 0.1,
    width: 0.35,
    height: 0.28,
    comment: 'Western ridge'
  }
];

export function SurveyNotes() {
  const [value, setValue] = useState(annotations);
  return (
    <ImageAnnotator
      src={valley}
      alt="Mountain valley with a river"
      value={value}
      onChange={setValue}
      style={{ maxWidth: '42rem' }}
    />
  );
}

export function ReviewMode() {
  return (
    <FilePreview
      file={{
        name: 'Valley.jpg',
        url: valley,
        mimeType: 'image/jpeg',
        alt: 'Mountain valley with a river'
      }}
      renderers={[
        {
          matches: (file) => file.mimeType?.startsWith('image/') === true,
          render: (file) =>
            file.url && (
              <ImageAnnotator
                src={file.url}
                alt={file.alt ?? file.name}
                defaultValue={annotations}
                readOnly
              />
            )
        }
      ]}
      style={{ maxWidth: '36rem' }}
    />
  );
}
