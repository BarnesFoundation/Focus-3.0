const toMilliSeconds = (hours: number) => hours * 3600 * 1000;

/** Returns the time as it was [x] hours ago in milliseconds */
export const generateTimeAgo = (hours: number) => {
  const hoursInMilliSeconds = toMilliSeconds(hours);
  return Date.now() - hoursInMilliSeconds;
};
