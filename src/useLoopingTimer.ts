import { useCallback, useEffect, useRef, useState } from 'react';

import { integerSchema, simpleParse } from './utils/zodUtils';

type TimerProps = {
  seconds: number;
};

export default function useLoopingTimer({ seconds }: TimerProps) {
  seconds = simpleParse(integerSchema.gt(0), seconds);

  const timerRef = useRef({ seconds, restarted: false });
  const [stop, setStop] = useState(false);

  const stopTimer = useCallback(() => setStop(true), []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newValue = timerRef.current.seconds === 1 ? seconds : timerRef.current.seconds - 1;
      timerRef.current.seconds = newValue;
      timerRef.current.restarted = newValue === seconds;
    }, 1000);

    if (stop) {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [seconds, stop]);

  return { timer: timerRef.current, stopTimer };
}
