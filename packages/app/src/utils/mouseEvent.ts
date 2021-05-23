export function isLeftButtonClicked(event: React.MouseEvent) {
  return event.button === 0;
}

export function isRightButtonClicked(event: React.MouseEvent) {
  return event.button === 2;
}
