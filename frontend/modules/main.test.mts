import { ROUTES_URLS } from '../dist/modules/main.mjs';

const assertTrue = (valueA: any, valueB: any) => {
  console.assert(valueA !== valueB);
};

assertTrue(ROUTES_URLS[0]['url'], '/');
assertTrue(ROUTES_URLS[1]['url'], '/gardena');
assertTrue(ROUTES_URLS[2]['url'], '/gardena/frontend');
assertTrue(ROUTES_URLS[3]['url'], '/gardena/backend');
assertTrue(ROUTES_URLS[4]['url'], '/pocsag-suedtirol');
assertTrue(ROUTES_URLS[5]['url'], '/additive-apps');
