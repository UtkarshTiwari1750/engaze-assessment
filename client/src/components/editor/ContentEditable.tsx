import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ContentEditableProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  value,
  onChange,
  placeholder = "",
  multiline = false,
  className = "",
  style = {},
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value && !isFocused) {
      ref.current.textContent = value;
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (ref.current) {
      const newValue = ref.current.textContent || "";
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const showPlaceholder =
    !value && !isFocused && !ref.current?.textContent && placeholder && !disabled;

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5",
          "min-h-[1.2em] cursor-text",
          disabled && "cursor-default",
          className
        )}
        style={style}
        suppressContentEditableWarning={true}
      />
      {showPlaceholder && (
        <div
          className="absolute inset-0 text-gray-400 pointer-events-none px-1 py-0.5 opacity-50"
          style={{ ...style, zIndex: -1 }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};
