import React, { useState } from 'react';
import { SegmentedControl } from '../SegmentedControl';
import { Textarea } from '../Textarea';
import { NumberInput } from '../NumberInput';
import { PasswordInput } from '../PasswordInput';
import { Rating } from '../Rating';
import { Slider } from '../Slider';
import { RangeSlider } from '../RangeSlider';
import { ColorPicker } from '../ColorPicker';
import { Dropzone } from '../Dropzone';
import { Button } from '../Button';

export default { title: 'Catalog/Form components' };

export function Segmented() {
  const [value, setValue] = useState('list');
  return (
    <SegmentedControl
      value={value}
      onChange={setValue}
      data={[
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Board', value: 'board' }
      ]}
    />
  );
}

export function TextareaShowcase() {
  const [value, setValue] = useState('');
  return (
    <Textarea
      aria-label="Description"
      placeholder="Write a description"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      minRows={3}
      autosize
    />
  );
}

export function NumberInputShowcase() {
  const [value, setValue] = useState<number | null>(10);
  return <NumberInput aria-label="Quantity" value={value} onChange={setValue} min={0} max={100} />;
}

export function PasswordInputShowcase() {
  return <PasswordInput aria-label="Password" placeholder="Enter password" />;
}

export function RatingShowcase() {
  const [value, setValue] = useState(3);
  return <Rating value={value} onChange={setValue} />;
}

export function SliderShowcase() {
  const [value, setValue] = useState(40);
  return <Slider label="Opacity" value={value} onChange={setValue} />;
}

export function RangeSliderShowcase() {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return <RangeSlider label="Price" value={value} onChange={setValue} />;
}

export function ColorPickerShowcase() {
  const [value, setValue] = useState('#3366ff');
  return <ColorPicker label="Accent" value={value} onChange={setValue} />;
}

export function DropzoneShowcase() {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Dropzone
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        onDrop={(dropped) => setFiles(dropped.map((file) => file.name))}
      />
      <div>Selected: {files.join(', ') || 'none'}</div>
      <Button size="small" onClick={() => setFiles([])}>
        Clear
      </Button>
    </div>
  );
}
