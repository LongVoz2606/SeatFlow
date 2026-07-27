import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ICountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<ICountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const calculateTimeLeft = () => {
      const diff = targetTime - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
      isWarning 
        ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300 animate-pulse' 
        : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
    }`}>
      <Clock className="w-4 h-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-xs font-normal opacity-80">thời gian giữ ghế</span>
    </div>
  );
};

export default CountdownTimer;
