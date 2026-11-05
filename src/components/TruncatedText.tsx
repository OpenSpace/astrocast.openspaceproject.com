import { type PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
import { Text, type TextProps, Tooltip, type TooltipProps } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';

interface Props extends PropsWithChildren, TextProps {
  tooltipProps?: Partial<TooltipProps>;
}

/**
 * Text truncated to a single line with a tooltip. The tooltip shows the full
 * text on hover, and is only shown if the text is actually truncated.
 */
export function TruncatedText({ tooltipProps, children, style, ...rest }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  // Attaching this ref causes the component to rerender when the text is
  // resized, which is necessary to determine if the text is truncated or not.
  const [resizeRef, rect] = useResizeObserver();

  const ref = (node: HTMLParagraphElement | null) => {
    textRef.current = node;
    resizeRef(node);
  };

  // Re-measure after mount, text changes and resizes so the tooltip
  // visibility always reflects the current truncation state.
  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) {
      return;
    }
    setShowTooltip(
      element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight
    );
  }, [children, rect]);

  return (
    <Tooltip label={children} {...tooltipProps} disabled={!showTooltip}>
      <Text
        truncate
        style={{
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
          hyphens: 'none',
          ...(style ?? {})
        }}
        {...rest}
        ref={ref}
      >
        {children}
      </Text>
    </Tooltip>
  );
}
