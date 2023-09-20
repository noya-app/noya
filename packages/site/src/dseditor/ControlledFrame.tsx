import { assignRef } from 'noya-react-utils';
import React, {
  HTMLProps,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Props extends HTMLProps<HTMLIFrameElement> {
  onReady?: () => void;
  title: string;
}

export const ControlledFrame = memo(
  forwardRef(function ControlledFrame(
    { onReady, ...props }: Props,
    forwardedRef: React.ForwardedRef<HTMLIFrameElement>,
  ) {
    const ref = useRef<HTMLIFrameElement | null>(null);
    const [id] = useState(() => Math.random().toString());

    // Listen to messages from the iframe. When the iframe is ready, call onReady
    useEffect(() => {
      const listener = (event: MessageEvent) => {
        let ok: boolean = false;

        try {
          ok = event.data.type === 'ready' && event.data.id === id;
        } catch (e) {}

        if (ok) {
          onReady?.();
        }
      };

      window.addEventListener('message', listener);

      return () => {
        window.removeEventListener('message', listener);
      };
    }, [id, onReady]);

    const handleRef = useCallback(
      (value: HTMLIFrameElement | null) => {
        ref.current = value;
        assignRef(forwardedRef, value);
      },
      [forwardedRef],
    );

    return (
      <iframe
        ref={handleRef}
        tabIndex={-1}
        style={{
          width: '100%',
          height: '100%',
        }}
        {...props}
        title={props.title}
        // Ensure html5 doctype for proper styling
        srcDoc={`<!DOCTYPE html>
<head>
<style>
  html, body { height: 100%; overflow: hidden; }
 
  *::selection {
    background-color: rgb(179,215,254);
  }

  @keyframes noya-shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .noya-skeleton-shimmer {
    animation: noya-shimmer 6s infinite linear;
    background: linear-gradient(90deg, #ffffff00, #e2e8f0dd, #ffffff00);
    background-size: 200% 100%;
  }
</style>
<script>
  const callback = () => {
    parent.postMessage({ type: 'ready', id: ${JSON.stringify(id)} }, '*');
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
</script>
</head>
`}
      />
    );
  }),
);
