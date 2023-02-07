import cookie from 'cookie';

export function addShareCookie(id: string) {
  if (typeof document === 'undefined') return;

  const map = cookie.parse(document.cookie);
  const updatedShares = encodeListCookie(map.noya_shares, id);

  document.cookie = cookie.serialize('noya_shares', updatedShares, {
    path: '/',
  });
}

function encodeListCookie(list: string | undefined, value: string) {
  const shares = (list ?? '').split(',').filter(Boolean);
  const sharesSet = new Set(shares);
  sharesSet.add(value);

  return [...sharesSet].join(',');
}
