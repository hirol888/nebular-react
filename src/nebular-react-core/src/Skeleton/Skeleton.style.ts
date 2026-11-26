import { createStyles, keyframes } from '@nebular-react/styles';

export interface SkeletonStylesParams {
  circle: boolean;
  animate: boolean;
  radius?: number | string;
}

export default createStyles((_theme, { circle, animate, radius }: SkeletonStylesParams) => {
  const pulse = keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.45 }
  });

  return {
    root: {
      display: 'block',
      minHeight: '0.75rem',
      backgroundColor: 'var(--skeleton-background-color, var(--background-basic-color-3, #e9ecef))',
      borderRadius: circle
        ? '50%'
        : typeof radius === 'number'
          ? `${radius}px`
          : radius || 'var(--skeleton-border-radius, 0.25rem)',
      animation: animate ? `${pulse} 1.5s ease-in-out infinite` : undefined
    }
  };
});
