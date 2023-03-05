import { useNebularDir } from '@nebular-react/styles';
import {
  GlobalLogicalPosition,
  GlobalPhysicalPosition,
  GlobalPosition
} from '../use-global-position-strategy/types';

export function usePositionHelper() {
  const dir = useNebularDir();

  const toLogicalPosition = (position: GlobalPosition): GlobalLogicalPosition => {
    if (Object.values(GlobalLogicalPosition).includes(position as GlobalLogicalPosition)) {
      return position as GlobalLogicalPosition;
    }

    if (dir === 'ltr') {
      return toLogicalPositionWhenLtr(position as GlobalPhysicalPosition);
    }
    return toLogicalPositionWhenRtl(position as GlobalPhysicalPosition);
  };

  const toPhysicalPosition = (position: GlobalPosition): GlobalPhysicalPosition => {
    if (Object.values(GlobalPhysicalPosition).includes(position as GlobalPhysicalPosition)) {
      return position as GlobalPhysicalPosition;
    }

    if (dir === 'ltr') {
      return toPhysicalPositionWhenLtr(position as GlobalLogicalPosition);
    }
    return toPhysicalPositionWhenRtl(position as GlobalLogicalPosition);
  };

  const isTopPosition = (position: GlobalPosition) => {
    const logicalPosition = toLogicalPosition(position);

    return (
      logicalPosition === GlobalLogicalPosition.TOP_END ||
      logicalPosition === GlobalLogicalPosition.TOP_START
    );
  };

  const isRightPosition = (position: GlobalPosition) => {
    const physicalPosition = toPhysicalPosition(position);

    return (
      physicalPosition === GlobalPhysicalPosition.TOP_RIGHT ||
      physicalPosition === GlobalPhysicalPosition.BOTTOM_RIGHT
    );
  };

  const toLogicalPositionWhenLtr = (position: GlobalPhysicalPosition): GlobalLogicalPosition => {
    switch (position) {
      case GlobalPhysicalPosition.TOP_RIGHT:
        return GlobalLogicalPosition.TOP_END;
      case GlobalPhysicalPosition.TOP_LEFT:
        return GlobalLogicalPosition.TOP_START;
      case GlobalPhysicalPosition.BOTTOM_RIGHT:
        return GlobalLogicalPosition.BOTTOM_END;
      case GlobalPhysicalPosition.BOTTOM_LEFT:
        return GlobalLogicalPosition.BOTTOM_START;
    }
  };

  const toLogicalPositionWhenRtl = (position: GlobalPhysicalPosition): GlobalLogicalPosition => {
    switch (position) {
      case GlobalPhysicalPosition.TOP_RIGHT:
        return GlobalLogicalPosition.TOP_START;
      case GlobalPhysicalPosition.TOP_LEFT:
        return GlobalLogicalPosition.TOP_END;
      case GlobalPhysicalPosition.BOTTOM_RIGHT:
        return GlobalLogicalPosition.BOTTOM_START;
      case GlobalPhysicalPosition.BOTTOM_LEFT:
        return GlobalLogicalPosition.BOTTOM_END;
    }
  };

  const toPhysicalPositionWhenLtr = (position: GlobalLogicalPosition): GlobalPhysicalPosition => {
    switch (position) {
      case GlobalLogicalPosition.TOP_START:
        return GlobalPhysicalPosition.TOP_LEFT;
      case GlobalLogicalPosition.TOP_END:
        return GlobalPhysicalPosition.TOP_RIGHT;
      case GlobalLogicalPosition.BOTTOM_START:
        return GlobalPhysicalPosition.BOTTOM_LEFT;
      case GlobalLogicalPosition.BOTTOM_END:
        return GlobalPhysicalPosition.BOTTOM_RIGHT;
    }
  };

  const toPhysicalPositionWhenRtl = (position: GlobalLogicalPosition): GlobalPhysicalPosition => {
    switch (position) {
      case GlobalLogicalPosition.TOP_START:
        return GlobalPhysicalPosition.TOP_RIGHT;
      case GlobalLogicalPosition.TOP_END:
        return GlobalPhysicalPosition.TOP_LEFT;
      case GlobalLogicalPosition.BOTTOM_START:
        return GlobalPhysicalPosition.BOTTOM_RIGHT;
      case GlobalLogicalPosition.BOTTOM_END:
        return GlobalPhysicalPosition.BOTTOM_LEFT;
    }
  };

  return { toLogicalPosition, toPhysicalPosition, isTopPosition, isRightPosition };
}
