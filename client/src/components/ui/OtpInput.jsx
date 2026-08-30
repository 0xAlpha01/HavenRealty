import { useEffect, useRef } from 'react';

const OtpInput = ({ length = 6, value, onChange, disabled = false }) => {
  const inputsRef = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const setDigit = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDigit(index, '');
      return;
    }

    const chars = raw.split('');
    let cursor = index;
    chars.forEach((char) => {
      if (cursor < length) {
        setDigit(cursor, char);
        cursor += 1;
      }
    });

    const nextEmptyIndex = Math.min(cursor, length - 1);
    inputsRef.current[nextEmptyIndex]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-10 rounded-lg border border-gray-300 text-center text-lg font-semibold text-navy-900 focus:border-navy-400 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
};

export default OtpInput;
