export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 1) {
    return "Now";
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return `${diffInMinutes}m`;
  } else if (diffInSeconds < 86400) {
    const diffInHours = Math.floor(diffInSeconds / 3600);
    return `${diffInHours}h`;
  } else {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Optional: use 12-hour clock, set to false for 24-hour clock
    };

    if (date.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }

    return date.toLocaleDateString("en-US", options);
  }
}
