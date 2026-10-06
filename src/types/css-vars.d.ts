import 'react';

// Declaration merging needs an interface here: it lets inline styles carry CSS custom properties.
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
