export const buildTimeFormat = (
  twelveHoursFormat: boolean | undefined,
  withSeconds: boolean | undefined,
  singleColumn: boolean | undefined,
  dateFns: any
) => {
  if (twelveHoursFormat) {
    return `${
      withSeconds && !singleColumn
        ? dateFns.getTwelveHoursFormatWithSeconds()
        : dateFns.getTwelveHoursFormat()
    }`;
  }
  return `${
    withSeconds && !singleColumn
      ? dateFns.getTwentyFourHoursFormatWithSeconds()
      : dateFns.getTwentyFourHoursFormat()
  }`;
};
