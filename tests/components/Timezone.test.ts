import moment from 'moment';
import {
  fromTimeZone,
  getTimeZoneOffset,
  isValidTimeZone,
  shiftFromTimeZone,
  shiftToTimeZone,
  toTimeZone
} from '@nebular-react/core';

const NY = 'America/New_York';
const HOUR = 60 * 60 * 1000;

describe('timezone helpers', () => {
  it('validates IANA time zones', () => {
    expect(isValidTimeZone(NY)).toBe(true);
    expect(isValidTimeZone('Europe/London')).toBe(true);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });

  it('computes standard and daylight offsets', () => {
    expect(getTimeZoneOffset(new Date('2024-01-15T12:00:00Z'), NY)).toBe(-5 * HOUR);
    expect(getTimeZoneOffset(new Date('2024-07-15T12:00:00Z'), NY)).toBe(-4 * HOUR);
  });

  it('converts an instant to the zone wall clock', () => {
    const wall = toTimeZone(new Date('2024-01-15T12:00:00Z'), NY);

    expect(wall.getFullYear()).toBe(2024);
    expect(wall.getMonth()).toBe(0);
    expect(wall.getDate()).toBe(15);
    expect(wall.getHours()).toBe(7);
    expect(wall.getMinutes()).toBe(0);
  });

  it('converts a zone wall clock back to an instant', () => {
    const wall = new Date(2024, 0, 15, 7, 0, 0, 0);

    expect(fromTimeZone(wall, NY).toISOString()).toBe('2024-01-15T12:00:00.000Z');
  });

  it('round-trips across DST boundaries', () => {
    const summerWall = new Date(2024, 6, 15, 8, 30, 0, 0);
    const summerInstant = fromTimeZone(summerWall, NY);

    expect(summerInstant.toISOString()).toBe('2024-07-15T12:30:00.000Z');
    expect(toTimeZone(summerInstant, NY).getHours()).toBe(8);

    // Ambiguous fall-back time: 01:30 happens twice, conversion stays stable.
    const fallWall = new Date(2024, 10, 3, 1, 30, 0, 0);
    const fallInstant = fromTimeZone(fallWall, NY);

    expect(toTimeZone(fallInstant, NY).getHours()).toBe(1);
    expect(toTimeZone(fallInstant, NY).getMinutes()).toBe(30);
  });

  it('normalizes non-existent spring-forward times', () => {
    const missingWall = new Date(2024, 2, 10, 2, 30, 0, 0);
    const instant = fromTimeZone(missingWall, NY);

    // 02:30 does not exist in New York; JS normalizes it to 03:30 EDT.
    expect(toTimeZone(instant, NY).getHours()).toBe(3);
  });

  it('keeps the absolute instant when shifting in both directions', () => {
    const original = new Date('2024-07-15T12:30:00.000Z');
    const wall = shiftToTimeZone(original, NY);

    expect(wall).toBeInstanceOf(Date);
    expect((wall as Date).getHours()).toBe(8);
    expect((shiftFromTimeZone(wall, NY) as Date).toISOString()).toBe(original.toISOString());
  });

  it('preserves Moment instances', () => {
    const original = moment.utc('2024-01-15T12:00:00.000Z');
    const wall = shiftToTimeZone(original, NY);

    expect(moment.isMoment(wall)).toBe(true);
    expect((wall as moment.Moment).valueOf()).toBe(original.valueOf());
    expect((wall as moment.Moment).hours()).toBe(7);
    expect((shiftFromTimeZone(wall, NY) as moment.Moment).valueOf()).toBe(original.valueOf());
  });
});
