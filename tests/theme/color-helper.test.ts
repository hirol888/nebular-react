import { hexToRgbA, mix, shade, tint } from '@nebular-react/styles';

describe('color helpers', () => {
  it('mixes two colors by weight', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 50)).toBe('#7f7f7f');
    expect(mix('#000000', '#ffffff', 100)).toBe('#000000');
  });

  it('shades a color towards black', () => {
    expect(shade('#123456', 0)).toBe('#123456');
    expect(shade('#ffffff', 50)).toBe('#7f7f7f');
    expect(shade('#123456', 100)).toBe('#000000');
  });

  it('tints a color towards white', () => {
    expect(tint('#000000', 0)).toBe('#000000');
    expect(tint('#123456', 50)).toBe('#8899aa');
    expect(tint('#000000', 100)).toBe('#ffffff');
  });

  it('converts short and full hex colors to rgba', () => {
    expect(hexToRgbA('#fff', 0.5)).toBe('rgba(255,255,255,0.5)');
    expect(hexToRgbA('#3366FF', 0.25)).toBe('rgba(51,102,255,0.25)');
    expect(hexToRgbA('#000000', 1)).toBe('rgba(0,0,0,1)');
  });

  it('rejects invalid hex colors', () => {
    expect(() => hexToRgbA('#12345', 0.5)).toThrow('Bad Hex');
    expect(() => hexToRgbA('red', 0.5)).toThrow('Bad Hex');
    expect(() => hexToRgbA('#gggggg', 0.5)).toThrow('Bad Hex');
  });
});
