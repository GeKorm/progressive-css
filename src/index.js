const React = require('react');
const hoistStatics  = require('hoist-non-react-statics');

const isProd = process.env.NODE_ENV == 'production';
// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{__html: ' '}} />;
let loadedChunks;

const pathNotLoaded = (path) => {
  const exists = loadedChunks[path] && loadedChunks[path] > 0;
  if (!exists) {
    // Look to refactor this side effect out of here
    loadedChunks[path] = loadedChunks[path] ? loadedChunks[path] + 1 : 1;
  }
  return !exists;
};

function getDisplayName(WrappedComponent) {
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return name.startsWith('_') ? name.slice(1) : name;
}

/**
 * Enhancer that places <link ref="stylesheet" ...> before your component
 *
 * @param paths {string[]} - Paths to css files relative to root. Supports
 * dot (.) delimited globs, eg: `['/css/AwesomeComponent.*.css']` will reference
 * `AwesomeComponent.css` during development and `AwesomeComponent.hash.css` if it exists in production
 * @param [scriptBlock=true] {boolean} - Inject empty script tags to prevent unstyled content flash in Firefox
 * @returns {function(*): function(ReactElement): *}
 */
const withCSS = (paths, scriptBlock = true) => (BaseComponent) => {
  class CSS extends React.Component {
    static displayName = `withCSS(${getDisplayName(BaseComponent)})`;

    constructor(props) {
      super(props);
      let hrefs = paths;
      const loadedChunksSize = loadedChunks && Object.keys(loadedChunks).length;
      if (!isProd && module.hot && loadedChunksSize > 0) {
        loadedChunks = {};
      }

      if (!loadedChunks || loadedChunksSize < 1) {
        loadedChunks = [...new Set(hrefs)].reduce((acc, cur) => {
          acc[cur] = 1;
          return acc;
        }, {});
      } else {
        hrefs = hrefs.filter(pathNotLoaded);
      }
      this.state = { hrefs };
    }

    componentWillUnmount() {
      if (!isProd && module.hot) {
        return;
      }
      paths.forEach((path) => loadedChunks[path]--);
    }

    render() {
      return (
        <>
          {this.state.hrefs.map((href) => <link rel="stylesheet" href={href} key={href} />)}
          {scriptBlock && isProd ? script : null}
          <BaseComponent {...this.props} />
        </>
      );
    }
  }

  return hoistStatics(CSS, BaseComponent);
};

module.exports = withCSS;
