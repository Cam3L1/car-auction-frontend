import { useState, useEffect } from "react";

// Live countdown timer used on every auction card and the detail page.
// It always counts down to the SERVER-stored end_time (never the
// client's clock as the source of truth - the end_time comes from the
// database with the car data).
//
// Component lifecycle trace:
//   1. MOUNT: useState initialises `remaining` = endTime - now
//   2. useEffect runs after mount: setInterval starts ticking
//   3. every 1 second: remaining is recalculated -> setState -> re-render
//   4. when remaining <= 0: the interval stops itself and onExpire()
//      fires - the parent refetches the car, so the auction flips to
//      "Ended" in the UI
//   5. UNMOUNT (user navigates away): the cleanup function clears the
//      interval - without it the timer would keep running in the
//      background forever
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

  // break the milliseconds into days / hours / minutes / seconds
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // urgency level drives the chip colour. The colour is never the only
  // signal: the remaining time itself is always printed as text.
  let level = "high";
  if (totalSeconds < 3600) level = "low"; // under 1 hour  -> red
  else if (totalSeconds < 86400) level = "mid"; // under 1 day -> amber

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <span className={`countdown-chip ${level}`}>
      ⏳ {days > 0 ? `${days}d ` : ""}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default Countdown;
