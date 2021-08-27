import { Menu } from 'electron';
import { ApplicationMenuItemType, MessageFromEmbedded } from 'noya-embedded';
import { visit } from 'tree-visit';
import { ActionContext } from '../types';

function visitMenuItems(
  items: Electron.MenuItemConstructorOptions[],
  onEnter: (item: Electron.MenuItemConstructorOptions) => void,
) {
  visit<Electron.MenuItemConstructorOptions>(
    { submenu: items },
    {
      getChildren: (options) =>
        Array.isArray(options.submenu) ? options.submenu : [],
      onEnter: onEnter,
    },
  );
}

export function setMenu(
  data: Extract<MessageFromEmbedded, { type: 'setMenu' }>,
  context: ActionContext,
) {
  const { value: menu } = data;

  visitMenuItems(menu, (options) => {
    if (!options.id) return;

    options.click = () =>
      context.sendMessage({
        type: 'menuCommand',
        value: options.id as ApplicationMenuItemType,
      });
  });

  menu.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
