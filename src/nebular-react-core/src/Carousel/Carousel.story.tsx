import React from 'react';
import { Carousel } from './Carousel';

export default { title: 'Carousel', component: Carousel };

const slideBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '1rem',
  color: '#ffffff',
  fontSize: '1.5rem',
  fontWeight: 600
};

const slides = [
  <div
    key="one"
    style={{
      ...slideBaseStyle,
      background: 'linear-gradient(135deg, #3366ff 0%, #5a8dee 100%)'
    }}
  >
    Slide one
  </div>,
  <div
    key="two"
    style={{
      ...slideBaseStyle,
      background: 'linear-gradient(135deg, #00d68f 0%, #2ce69b 100%)'
    }}
  >
    Slide two
  </div>,
  <div
    key="three"
    style={{
      ...slideBaseStyle,
      background: 'linear-gradient(135deg, #ff3d71 0%, #ff708d 100%)'
    }}
  >
    Slide three
  </div>
];

export function Showcase() {
  return <Carousel slides={slides} ariaLabel="Product highlights" />;
}

export function Vertical() {
  return (
    <Carousel slides={slides} orientation="vertical" height={360} ariaLabel="Vertical carousel" />
  );
}

export function AutoPlay() {
  return (
    <Carousel slides={slides} autoPlay autoPlayInterval={3000} ariaLabel="Auto playing carousel" />
  );
}
