import { NbFontIconPackParams, NbIconPackParams } from './icon-pack';

export interface NbIconOptions {
  [name: string]: any;
}

export interface NbIconModel {
  getClasses(options?: NbIconOptions): string[];
  getContent(options?: NbIconOptions): string;
}

export interface NbOriginalEvaIcon {
  toSvg(options: NbEvaIconOptions): any;
}

export interface NbEvaIconOptions {
  width: string,
  height: string,
  fill: string,
  animation: {
    type: string,
    hover: boolean,
    infinite: boolean,
  },
}

export class NbFontIcon implements NbIconModel {

  constructor(protected name: string, protected content: any, protected params: NbFontIconPackParams = {}) { }

  getClasses(options?: NbIconOptions): string[] {
    const classes = [];

    if (this.params.packClass) {
      classes.push(this.params.packClass);
    }

    const name = this.params.iconClassPrefix ? `${this.params.iconClassPrefix}-${this.name}` : this.name;
    classes.push(name);
    return classes;
  }

  getContent(options?: NbIconOptions): string {
    return this.content;
  }
}

export class NbSvgIcon implements NbIconModel {

  constructor(protected name: string, protected content: any, protected params: NbIconPackParams = {}) { }

  getClasses(options?: NbIconOptions): string[] {
    const classes = [];

    if (this.params.packClass) {
      classes.push(this.params.packClass);
    }
    return classes;
  }

  getContent(options?: NbIconOptions): string {
    return this.content;
  }
}

export class NbEvaSvgIcon extends NbSvgIcon {

  constructor(protected override name: string, protected override content: NbOriginalEvaIcon) {
    super(name, '');
  }

  override getContent(options: any): string {
    return this.content.toSvg({
      width: '100%',
      height: '100%',
      fill: 'currentColor',
      ...options
    });
  }
}
