export function formatTimestamp(timestamp: string) {
  const ms_per_day = 24 * 60 * 60 * 1000;
  const date = new Date(timestamp);
  const now = new Date();

  const days_diff = Math.floor((now.getTime() - date.getTime()) / ms_per_day);
  const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const am_pm = date.getHours() >= 12 ? 'PM' : 'AM';

  if (days_diff === 0) {
    return `Today at ${hours}:${minutes} ${am_pm}`;
  } else if (days_diff === 1) {
    return `Yesterday at ${hours}:${minutes} ${am_pm}`;
  } else {
    return `${date.toLocaleString()} at ${hours}:${minutes} ${am_pm}`;
  }
}