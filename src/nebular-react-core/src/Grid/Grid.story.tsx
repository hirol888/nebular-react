import React from 'react';
import { Grid } from './Grid';

export default { title: 'Grid', component: Grid };

const boxStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
  border: '1px solid var(--border-basic-color-3, #e4e9f2)',
  color: 'var(--text-basic-color, #222b45)'
};

export function Basic() {
  return (
    <Grid gap="sm">
      <Grid.Col span={4}>
        <div style={boxStyle}>span 4</div>
      </Grid.Col>
      <Grid.Col span={8}>
        <div style={boxStyle}>span 8</div>
      </Grid.Col>
      <Grid.Col span={6}>
        <div style={boxStyle}>span 6</div>
      </Grid.Col>
      <Grid.Col span={6}>
        <div style={boxStyle}>span 6</div>
      </Grid.Col>
    </Grid>
  );
}

export function OffsetAndOrder() {
  return (
    <Grid gap="sm">
      <Grid.Col span={4} offset={2}>
        <div style={boxStyle}>offset 2, span 4</div>
      </Grid.Col>
      <Grid.Col span={3} order={2}>
        <div style={boxStyle}>order 2</div>
      </Grid.Col>
      <Grid.Col span={3} order={1}>
        <div style={boxStyle}>order 1</div>
      </Grid.Col>
    </Grid>
  );
}

export function CustomColumns() {
  return (
    <Grid columns={6} gap="md">
      <Grid.Col span={2}>
        <div style={boxStyle}>span 2 of 6</div>
      </Grid.Col>
      <Grid.Col span={4}>
        <div style={boxStyle}>span 4 of 6</div>
      </Grid.Col>
      <Grid.Col span="auto">
        <div style={boxStyle}>auto</div>
      </Grid.Col>
    </Grid>
  );
}
