import React from "react";
import { parseTimers } from "@/parseTimers";
import { TimerButton } from "@/components/TimerButton";

interface StepWithTimersProps {
  text: string;
}

export const StepWithTimers: React.FC<StepWithTimersProps> = ({ text }) => {
  const segments = parseTimers(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'text'
          ? <span key={i}>{seg.text}</span>
          : <TimerButton key={i} text={seg.text} seconds={seg.seconds} />
      )}
    </>
  );
};
