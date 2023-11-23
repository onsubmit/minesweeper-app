import { useEffect, useState } from 'react';

import { integerSchema, simpleParse } from './utils/zodUtils';

type TimerProps = {
  seconds: number;
};

export default function useLoopingTimer({ seconds }: TimerProps) {
  seconds = simpleParse(integerSchema.gt(0), seconds);

  const [timer, setTimer] = useState({ seconds, restarted: false });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newValue = timer.seconds === 1 ? seconds : timer.seconds - 1;
      setTimer({ seconds: newValue, restarted: newValue === seconds });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [seconds, timer]);

  return [timer];
}
