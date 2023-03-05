import {
  CLOCKWISE_POSITIONS,
  COUNTER_CLOCKWISE_POSITIONS,
  HORIZONTAL_POSITIONS,
  Position,
  PositionAdjustment,
  VERTICAL_POSITIONS
} from './types';

export function getPositions(position: Position, adjustment: PositionAdjustment): Position[] {
  const positions = createPositions(position, adjustment);

  return positions;
}

function createPositions(position: Position, adjustment: PositionAdjustment) {
  switch (adjustment) {
    case 'noop':
      return [position];
    case 'clockwise':
      return reorderPreferredPositions(position, CLOCKWISE_POSITIONS);
    case 'counterclockwise':
      return reorderPreferredPositions(position, COUNTER_CLOCKWISE_POSITIONS);
    case 'horizontal':
      return reorderPreferredPositions(position, HORIZONTAL_POSITIONS);
    case 'vertical':
      return reorderPreferredPositions(position, VERTICAL_POSITIONS);
    default:
      return null;
  }
}

function reorderPreferredPositions(position: Position, positions: Position[]): Position[] {
  // Physical positions should be mapped to logical as adjustments use logical positions.
  const startPositionIndex = positions.indexOf(mapToLogicalPosition(position));
  const firstPart = positions.slice(startPositionIndex);
  const secondPart = positions.slice(0, startPositionIndex);
  return firstPart.concat(secondPart);
}

function mapToLogicalPosition(position: Position): Position {
  if (position === 'left') {
    return 'start';
  }
  if (position === 'right') {
    return 'end';
  }

  return position;
}
