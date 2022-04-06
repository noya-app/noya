import { UTF16 } from './utf16';
import { Base64 } from './base64';

/**
 * Serialize data to the clipboard.
 *
 * We convert the data into a base64-encoded string, wrapped in a paragraph tag.
 * This seems to work for every major browser.
 */
export const ClipboardUtils = {
  toEncodedHTML: <T>(data: T): string => {
    const json = JSON.stringify(data);
    const utf8 = UTF16.toUTF8(json);
    const base64 = Base64.encode(utf8);
    const html = `<p>(noya)${base64}</p>`;

    return html;
  },
  fromEncodedHTML: <T>(html: string): T | undefined => {
    const match = html.match(/<p>\(noya\)(.*?)<\/p>/);

    if (!match) return;

    const base64 = match[1];
    const utf8 = Base64.decode(base64);
    const json = UTF16.fromUTF8(utf8 as Uint8Array);
    const data = JSON.parse(json);

    return data;
  },
};
