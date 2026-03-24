export interface TimerSegment {
  type: 'timer';
  text: string;    // original matched text, e.g. "30 minutes"
  seconds: number; // duration in seconds
}

export interface TextSegment {
  type: 'text';
  text: string;
}

export type Segment = TextSegment | TimerSegment;

// Matches: "30 minutes", "2 hours", "45 seconds", "1 hr", "10 min",
//          "2 to 3 hours", "10-15 minutes"
const TIME_REGEX = /(\d+)(?:\s*(?:to|-)\s*(\d+))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/gi;

const UNIT_TO_SECONDS: Record<string, number> = {
  hour: 3600, hours: 3600, hr: 3600, hrs: 3600,
  minute: 60, minutes: 60, min: 60, mins: 60,
  second: 1, seconds: 1, sec: 1, secs: 1,
};

export function parseTimers(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  TIME_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TIME_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }

    const val1 = parseInt(match[1]);
    const val2 = match[2] ? parseInt(match[2]) : null;
    const unit = match[3].toLowerCase();
    const multiplier = UNIT_TO_SECONDS[unit] ?? 60;
    // For ranges, use the larger value
    const value = val2 !== null ? Math.max(val1, val2) : val1;

    segments.push({ type: 'timer', text: match[0], seconds: value * multiplier });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return segments;
}
