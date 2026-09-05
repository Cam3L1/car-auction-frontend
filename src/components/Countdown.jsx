import { useState, useEffect } from "react";
import { Badge } from "react-bootstrap";

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

  let variant = "success";
  if (totalSeconds < 3600) variant = "danger";
  else if (totalSeconds < 86400) variant = "warning";

  return (
    <Badge bg={variant} className="fs-6">
      ⏳ {days}d {hours}h {minutes}m {seconds}s
    </Badge>
  );
};

export default Countdown;
