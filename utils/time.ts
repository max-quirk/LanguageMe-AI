import { DAY_IN_MS } from "../constants/time";

// Format intervals in a human-readable format
export const formatInterval = (interval: number): string => {
  const minutes = Math.floor(interval / (60 * 1000));
  const hours = Math.floor(interval / (60 * 60 * 1000));
  const days = Math.floor(interval / DAY_IN_MS);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};
