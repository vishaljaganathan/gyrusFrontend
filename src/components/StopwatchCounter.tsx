import React, { useState, useEffect, useRef } from 'react';
import { CustomText as Text } from './CustomText';

interface StopwatchCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  style?: any;
}

const StopwatchCounter: React.FC<StopwatchCounterProps> = ({ value, duration = 1500, delay = 0, style }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const targetValueRef = useRef(value);

  useEffect(() => {
    // Reset whenever value changes
    targetValueRef.current = value;
    startTimeRef.current = null;
    setDisplayValue(0);

    let animationFrameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutExpo for a smoother finish
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeOutExpo * targetValueRef.current);
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(animate);
      }, delay);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [value, duration, delay]);

  const formatNumber = (num: number) => {
    let numStr = (num || 0).toString();
    if (num >= 100000) {
      return numStr.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1,");
    } else {
      return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  return <Text style={style}>{formatNumber(displayValue)}</Text>;
};

export default StopwatchCounter;
