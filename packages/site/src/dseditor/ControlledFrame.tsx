import { Size } from '@noya-app/noya-geometry';
import { assignRef } from 'noya-react-utils';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface Props {
  onReadyChange?: (ready: boolean) => void;
  onResize?: (size: Size) => void;
  title: string;
  colorScheme: 'light' | 'dark';
}

function useMessageListener(
  id: string,
  callbacks: Record<string, (event: MessageEvent) => void>,
) {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      try {
        if (event.data.id === id) {
          callbacksRef.current[event.data.type]?.(event);
        }
      } catch (e) {}
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [id]);
}

export const ControlledFrame = memo(
  forwardRef(function ControlledFrame(
    { onReadyChange, onResize, title, colorScheme }: Props,
    forwardedRef: React.ForwardedRef<HTMLIFrameElement>,
  ) {
    const ref = useRef<HTMLIFrameElement | null>(null);
    const [id] = useState(() => Math.random().toString());

    useMessageListener(id, {
      resize: (event) => onResize?.(event.data.size),
      ready: () => onReadyChange?.(true),
      keydown: (event) => {
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
      },
    });

    const handleRef = useCallback(
      (value: HTMLIFrameElement | null) => {
        if (!value) {
          onReadyChange?.(false);
        }

        ref.current = value;
        assignRef(forwardedRef, value);
      },
      [forwardedRef, onReadyChange],
    );

    const style = useMemo(() => ({ width: '100%', height: '100%' }), []);

    // Ensure html5 doctype for proper styling
    const srcDoc = `<!DOCTYPE html>
<head>
  <style>
    html, body, #noya-preview-root { height: 100%; margin: 0; padding: 0; }

    /* Hide scrollbar for Chrome, Safari and Opera */
    body::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge, and Firefox */
    body {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }

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

    ${colorScheme === 'dark' ? 'html { background: #111; }' : ''}
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

    // Handle window resize events
    window.addEventListener('resize', function(event) {
      parent.postMessage({ 
        id, 
        type: 'resize', 
        size: { width: window.innerWidth, height: window.innerHeight } 
      }, '*');
    });

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
  <script src="https://cdn.tailwindcss.com"></script>
</body>
`;

    return (
      <iframe
        key={srcDoc}
        ref={handleRef}
        tabIndex={-1}
        title={title}
        style={style}
        srcDoc={srcDoc}
      />
    );
  }),
);
