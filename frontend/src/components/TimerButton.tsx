import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "@chakra-ui/react";
import { LuTimer, LuTimerOff } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";

interface TimerButtonProps {
  text: string;
  seconds: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    });
  } catch {
    // audio not available
  }
}

type State = 'idle' | 'running' | 'done';

export const TimerButton: React.FC<TimerButtonProps> = ({ text, seconds }) => {
  const [state, setState] = useState<State>('idle');
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(seconds);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    remainingRef.current = seconds;
    setRemaining(seconds);
    setState('running');
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!);
        setRemaining(0);
        setState('done');
        playChime();
        toaster.create({
          title: "Timer done!",
          description: text,
          type: "success",
          duration: 10000,
          meta: { closable: true },
        });
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("Timer done!", { body: text });
        }
        setTimeout(() => {
          setState('idle');
          setRemaining(seconds);
        }, 3000);
      } else {
        setRemaining(remainingRef.current);
      }
    }, 1000);
  };

  const cancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState('idle');
    setRemaining(seconds);
  };

  if (state === 'running') {
    return (
      <Button size="xs" variant="outline" colorPalette="orange" onClick={cancel}>
        <LuTimerOff />
        {formatTime(remaining)}
      </Button>
    );
  }

  if (state === 'done') {
    return <Badge colorPalette="green">Done!</Badge>;
  }

  return (
    <Button size="xs" variant="outline" colorPalette="blue" onClick={start}>
      <LuTimer />
      {text}
    </Button>
  );
};
