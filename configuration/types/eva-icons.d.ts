declare module 'eva-icons' {
  interface EvaIconOptions {
    width: string;
    height: string;
    fill: string;
  }

  interface EvaIcon {
    toSvg(options: EvaIconOptions): string;
  }

  export const icons: Record<string, EvaIcon>;

  const eva: {
    icons: Record<string, EvaIcon>;
  };

  export default eva;
}
