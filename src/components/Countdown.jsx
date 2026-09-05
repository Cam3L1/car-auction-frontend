import { useState, useEffect } from "react";

// Live countdown timer: recalculates the remaining time against the
// server-stored auction end timestamp every second.
const Countdown = ({ endTime, onExpire }) => {
  const [remaining, setRemaining] = useState(() => new Date(endTime) - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const left = new Date(endTime) - new Date();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval); // timer reached zero: stop ticking
        if (onExpire) onExpire(); // notify the parent to refresh the auction
      }
    }, 1000);

    // cleanup: always clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [endTime]);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // urgency level drives the chip colour (colour is never the only signal:
  // the remaining time itself is always printed)
  let level = "high";
  if (totalSeconds < 3600) level = "low";
  else if (totalSeconds < 86400) level = "mid";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <span className={`countdown-chip ${level}`}>
      ⏳ {days > 0 ? `${days}d ` : ""}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default Countdown;
