import { registerLazyComponent } from './components/common.mjs';
import { registerStaticComponents } from './components/static/index.mjs';

type Component = string;

type Route = {
  url: string;
  component: Component;
};

const ROUTES = {
  '/': 'me',
  '/gardena': {
    '/': 'gardena-index',
    '/frontend': 'gardena-frontend',
    '/backend': 'gardena-backend',
  },
  '/pocsag-suedtirol': '<mgruber-pocsag-suedtirol></mgruber-pocsag-suedtirol>',
  '/additive-apps': '<mgruber-additive-apps></mgruber-additive-apps>',
};

function isObject(maybeObject: unknown) {
  return typeof maybeObject === 'object' && !Array.isArray(maybeObject) && maybeObject !== null;
}

// TODO: review again
function flattenRoute(parentPaths: string, urlPart: string, component: object | Component): Array<Route> {
  if (isObject(component)) {
    return Object.entries(component).reduce((accumulator: Array<Route>, entry: [string, string]) => {
      accumulator.push(...flattenRoute(`${parentPaths || ''}${urlPart === '/' ? '' : urlPart}`, entry[0], entry[1]));
      return accumulator;
    }, []);
  }

  // leading or trailing / is weird
  return [
    {
      url: `${parentPaths || ''}${parentPaths && urlPart === '/' ? '' : urlPart}`,
      component,
    } as Route,
  ];
}

export const ROUTES_URLS: Array<Route> = Object.entries(ROUTES).reduce(
  (accumulator: Array<Route>, entry: [string, string]) => {
    accumulator.push(...flattenRoute('', entry[0], entry[1]));
    return accumulator;
  },
  []
);

export async function init() {
  await registerStaticComponents();
  loadRoutes();
}

async function loadRoute() {
  const { pathname } = window.location;

  const routeToRender = ROUTES_URLS.find((route: Route) => route.url === pathname);

  if (!routeToRender) {
    console.error('route not found');

    history.replaceState(null, '', '/');

    return;
  }

  let componentName = 'mgruber-generic-error';
  try {
    componentName = await registerLazyComponent(routeToRender.component, 'routes');
  } catch (error) {
    console.error('error registering lazy component', error);
  }

  const routeContentElement = document.getElementById('route-content');

  if (!routeContentElement) {
    throw new Error('route content element not found');
  }

  routeContentElement.innerHTML = `<${componentName}></${componentName}>`;
}

function handleLinkClicks(event: PointerEvent) {
  if (!event.target) {
    return;
  }

  const aTag = (event.target as Element).closest('a');
  if (!aTag) {
    return;
  }

  const href = aTag.getAttribute('href');
  if (!href) {
    return;
  }

  // ignore absolute/external links and anchors
  if (href.startsWith('http') || href.startsWith('#')) {
    return;
  }

  event.preventDefault();

  history.pushState({}, '', href);

  loadRoute();
}

function loadRoutes() {
  window.addEventListener('popstate', loadRoute);
  document.addEventListener('click', handleLinkClicks);

  loadRoute();
}
