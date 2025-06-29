const GEO_LOC_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/geoip_cache.txt';
const IPV4_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt';
const GEO_USER_URL = 'https://geolocation-db.com/json/';

/**
 * Get the closest STUN server to the user
 * https://github.com/pradt2/always-online-stun
 */
export async function getOnlineStun() {
  const geoLocs = await fetch(GEO_LOC_URL).then((res) => res.json());

  const { latitude, longitude } = await fetch(GEO_USER_URL).then((res) =>
    res.json()
  );

  const allAddresses = await fetch(IPV4_URL).then((res) => res.text());

  return allAddresses
    .trim()
    .split('\n')
    .map((addr) => {
      if (!geoLocs[addr.split(':')?.[0]]) {
        return [];
      }
      const [stunLat, stunLon] = geoLocs[addr.split(':')[0]];
      const dist =
        ((latitude - stunLat) ** 2 + (longitude - stunLon) ** 2) ** 0.5;
      return [addr, dist];
    })
    .filter((x) => x.length)
    .sort(([, distA], [, distB]) => {
      return distA < distB ? -1 : distA > distB ? 1 : 0;
    })
    .map(([addr]) => ({ urls: 'stun:' + addr.toString() }));
}
