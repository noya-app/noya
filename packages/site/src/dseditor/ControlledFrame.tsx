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
          if (event.data.id === id) {
            switch (event.data.type) {
              case 'ready': {
                ok = true;
                break;
              }
              case 'keydown': {
                const customEvent = new KeyboardEvent('keydown', {
                  key: event.data.command.key,
                  keyCode: event.data.command.keyCode,
                  altKey: event.data.command.altKey,
                  shiftKey: event.data.command.shiftKey,
                  ctrlKey: event.data.command.ctrlKey,
                  metaKey: event.data.command.metaKey,
                  bubbles: true,
                });

                ref.current?.dispatchEvent(customEvent);
              }
            }
          }
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
    html, body, #noya-preview-root { height: 100%; overflow: hidden; margin: 0; padding: 0; }

    * {
      /* antd doesn't set a border-style or width, so we set these for convenience */
      border-width: 0;
      border-style: solid;
    }
  
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
</head>
<body>
  <div id="noya-preview-root"></div>
  <script>
    const id = ${JSON.stringify(id)};

    const callback = () => {
      parent.postMessage({ id, type: 'ready' }, '*');
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }

    // Propagate keyboard shortcuts (keydown events) to the parent window
    window.addEventListener('keydown', function(event) {
      // Check if Cmd (for Mac) or Ctrl (for other OS) is pressed
      // Also handle Escape for exiting editing mode
      if (event.metaKey || event.ctrlKey || event.key === 'Escape') {
        // If the key pressed is an arrow key or other key used during text editing
        // allow the default behavior and return.
        if (
          event.key === 'ArrowLeft' || 
          event.key === 'ArrowRight' || 
          event.key === 'ArrowUp' || 
          event.key === 'ArrowDown' ||
          event.key === 'Backspace' ||
          event.key === 'Delete' ||
          event.key === 'a' ||
          event.key === 'c' ||
          event.key === 'v' ||
          event.key === 'x' ||
          event.key === 'z' ||
          event.key === 'y'
        ) {
          return;
        }

        event.preventDefault();  // Prevent the default behavior (zoom)

        const command = {
          key: event.key,
          keyCode: event.keyCode,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
        }
    
        parent.postMessage({ id, type: 'keydown', command }, '*');
      }
    });
  </script>
</body>
`}
      />
    );
  }),
);
