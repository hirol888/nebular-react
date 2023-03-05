export const buildDateFormat = (
  twelveHoursFormat: boolean | undefined,
  withSeconds: boolean | undefined,
  singleColumn: boolean | undefined,
  calendarFns: any
) => {
  if (singleColumn) {
    return calendarFns.buildDateFormat(twelveHoursFormat);
  }
  return calendarFns.buildDateFormat(twelveHoursFormat, withSeconds);
};
