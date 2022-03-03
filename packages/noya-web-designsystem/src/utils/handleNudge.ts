// Given a KeyboardEvent, returns the nudge amount
export default function handleNudge(e: {
  key: string;
  shiftKey: boolean;
  altKey: boolean;
}): number | undefined {
  let handled = false;
  let amount = 0;

  switch (e.key) {
    case 'ArrowUp':
      amount = 1;
      handled = true;
      break;
    case 'ArrowDown':
      amount = -1;
      handled = true;
      break;
  }

  if (!handled) return;

  if (e.shiftKey) {
    amount *= 10;
  } else if (e.altKey) {
    amount *= 0.1;
  }

  return handled ? amount : undefined;
}
