import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { Button, Text, type TextProps } from '@mantine/core';

interface Props extends Omit<TextProps, 'children' | 'lineClamp'> {
  children: string;
  /** Number of lines to show when collapsed. */
  lineClamp?: number;
}

// Applied as inline styles so the clamp cannot be lost in the cascade
// (Mantine's own line-clamp rule relies on a zero-specificity :where()
// selector).
const clampStyles = (lineClamp: number): CSSProperties => ({
  display: '-webkit-box' as CSSProperties['display'],
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lineClamp,
  overflow: 'hidden'
});

/**
 * Text that collapses to a fixed number of lines. When the content overflows
 * the clamp, a "Show more" / "Show less" toggle appears below it.
 */
export function ClampedText({ children, lineClamp = 3, style, ...textProps }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Measure only while collapsed; the result is kept when expanded so the
  // toggle can switch to "Show less".
  useLayoutEffect(() => {
    if (expanded) {
      return;
    }
    const element = textRef.current;
    if (!element) {
      return;
    }

    const measure = () => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [children, expanded, lineClamp]);

  return (
    <>
      <Text
        ref={textRef}
        style={expanded ? style : { ...clampStyles(lineClamp), ...style }}
        {...textProps}
      >
        {children}
      </Text>
      {(overflows || expanded) && (
        <Button
          variant="subtle"
          size="xs"
          c="dimmed"
          fw={600}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </>
  );
}
