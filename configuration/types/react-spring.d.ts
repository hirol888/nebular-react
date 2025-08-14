import '@react-spring/web';
import type * as React from 'react';

declare module '@react-spring/web' {
    // garante que todo Animated.xxx aceite children
    interface AnimatedProps<P> {
        children?: React.ReactNode;
    }
}
