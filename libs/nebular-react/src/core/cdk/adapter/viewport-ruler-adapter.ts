import { inject, injectable } from "inversify";
import { TYPES } from "libs/nebular-react/src/ioc-types";
import { map } from "rxjs";
import { NbLayoutRulerService, NbLayoutScrollService, NbScrollPosition } from "../../services";
import { NbPlatform } from "../platform";
import { IViewportRuler, ViewportRuler } from "../scrolling";


@injectable()
export class NbViewportRulerAdapter extends ViewportRuler implements IViewportRuler {
  constructor(
    @inject(TYPES.NbPlatform) platform: NbPlatform,
    @inject(TYPES.NbLayoutRulerService) protected ruler: NbLayoutRulerService,
    @inject(TYPES.NbLayoutScrollService) protected scroll: NbLayoutScrollService
  ) {
    super(platform);
  }

  override getViewportSize() {
    let res: { width: number; height: number; } | null = null;
    /*
    * getDimensions call is really synchronous operation.
    * And we have to conform with the interface of the original service.
    * */
    this.ruler.getDimensions()
      .pipe(map(dimensions => ({ width: dimensions.clientWidth, height: dimensions.clientHeight })))
      .subscribe(rect => res = rect);

    return res!;
  }

  override getViewportScrollPosition() {
    let res: { left: number; top: number } | null = null;
    /*
    * getPosition call is really synchronous operation.
    * And we have to conform with the interface of the original service.
    * */
    this.scroll.getPosition()
      .pipe(map((position: NbScrollPosition) => ({ top: position.y, left: position.x })))
      .subscribe(position => res = position);
    return res!;
  }
}
