const React = require('react');
const hoistStatics = require('hoist-non-react-statics');

const isProd = process.env.NODE_ENV == 'production';
// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{ __html: ' ' }} />;
const chunkMap = new Map();
const persistedPaths = new Set();

function getDisplayName(WrappedComponent) {
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return name.startsWith('_') ? name.slice(1) : name;
}

function flushCSS() {
  const currentChunks = [...chunkMap.keys()];
  chunkMap.clear();
  persistedPaths.clear();

  return currentChunks;
}

function getCSS() {
  return [...chunkMap.keys()];
}

function appendLink(path) {
  persistedPaths.add(path);
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', path);
  document.head.appendChild(link);
}

/**
 * Enhancer that places <link ref="stylesheet" ...> before your component
 *
 * @param paths {string[]} - Paths to css files relative to root. Supports
 * dot (.) delimited globs, eg: `['/css/AwesomeComponent.*.css']` will reference
 * `AwesomeComponent.css` during development and `AwesomeComponent.hash.css` if it exists in
 *   production
 * @param [scriptBlock=true] {boolean} - Inject empty script tags to prevent unstyled content flash
 *   in Firefox
 * @param [persist=false] {boolean} - Keep the CSS loaded in the DOM (useful for modals, transitions etc)
 *   etc)
 * @returns {function(*): function(ReactElement): *}
 */
const withCSS = (paths, scriptBlock = true, persist = false) => (BaseComponent) => {
  class CSS extends React.Component {
    static displayName = `withCSS(${getDisplayName(BaseComponent)})`;

    constructor(props, context) {
      super(props, context);

      const hrefs = paths.filter((path) => {
        if (persistedPaths.has(path)) return false;

        const subscribers = chunkMap.get(path);
        if (subscribers) {
          subscribers.push(this);
        } else {
          chunkMap.set(path, [this]);
        }

        return !subscribers;
      });
      this.state = { hrefs };
    }

    componentWillUnmount() {
      paths.forEach((path) => {
        if (persistedPaths.has(path)) return;
        if (persist) appendLink(path);

        const subscribers = chunkMap.get(path);
        if (subscribers) {
          const index = subscribers.indexOf(this);
          subscribers.splice(index, 1);
          if (subscribers.length <= 0) {
            chunkMap.delete(path);
          } else {
            if (persist) {
              subscribers.forEach((sub) => sub.remove(path));
              return;
            }
            subscribers[0].add(path);
          }
        }
      });
    }

    add = (path) => {
      if (persist && persistedPaths.has(path)) {
        return;
      }

      if (!this.state.hrefs.includes(path)) {
        this.setState(({ hrefs }) => ({ hrefs: [...hrefs, path] }));
      }
    };

    remove = (path) => {
      if (this.state.hrefs.includes(path)) {
        this.setState(({ hrefs }) => ({ hrefs: hrefs.filter((_) => _ !== path) }));
      }
    };

    render() {
      const hrefs = this.state?.hrefs;

      return (
        <>
          {hrefs && hrefs.length > 0
            ? hrefs.map((href) => <link rel="stylesheet" type="text/css" href={href} key={href} />)
            : null}
          {hrefs && scriptBlock && isProd ? script : null}
          <BaseComponent {...this.props} />
        </>
      );
    }
  }

  return hoistStatics(CSS, BaseComponent);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.flushCSS = flushCSS;
exports.getCSS = getCSS;
exports.default = withCSS;
