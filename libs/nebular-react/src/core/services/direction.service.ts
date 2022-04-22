import { injectable } from 'inversify';
import { Observable, ReplaySubject } from 'rxjs';
import { share } from 'rxjs/operators';
import { NbLayoutDirection } from '../cdk/helper';

/**
 * Layout Direction Service.
 * Allows to set or get layout direction and listen to its changes
 */
@injectable()
export class NbLayoutDirectionService {
  private $directionChange = new ReplaySubject<NbLayoutDirection>(1);

  constructor(
    private direction = NbLayoutDirection.LTR,
  ) {
    this.setDirection(direction);
  }

  /**
   * Returns true if layout direction set to left to right.
   * @returns boolean.
   * */
  public isLtr(): boolean {
    return this.direction === NbLayoutDirection.LTR;
  }

  /**
   * Returns true if layout direction set to right to left.
   * @returns boolean.
   * */
  public isRtl(): boolean {
    return this.direction === NbLayoutDirection.RTL;
  }

  /**
   * Returns current layout direction.
   * @returns NbLayoutDirection.
   * */
  getDirection(): NbLayoutDirection {
    return this.direction;
  }

  /**
   * Sets layout direction
   * @param {NbLayoutDirection} direction
   */
  setDirection(direction: NbLayoutDirection) {
    this.direction = direction;
    this.$directionChange.next(direction);
  }

  /**
   * Triggered when direction was changed.
   * @returns Observable<Direction>.
   */
  onDirectionChange(): Observable<NbLayoutDirection> {
    return this.$directionChange.pipe(share<NbLayoutDirection>());
  }
}
