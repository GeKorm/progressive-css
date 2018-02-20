const React = require('react');

const isProd = process.env.NODE_ENV == 'production';
// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{__html: ' '}} />;
let loadedChunks;

const pathNotLoaded = (path) => {
  const exists = loadedChunks.has(path);
  if (!exists) {
    // Look to refactor this side effect out of here
    loadedChunks.add(path);
  }

  return !exists;
};

/**
 * Enhancer that places <link ref="stylesheet" ...> before your component
 *
 * @param paths {string[]} - Paths to css files relative to root. Supports
 * dot (.) delimited globs, eg: `['/css/AwesomeComponent.*.css']` will reference
 * `AwesomeComponent.css` during development and `AwesomeComponent.hash.css` if it exists in production
 * @param [firefox=true] {boolean} - Inject empty script tags to prevent unstyled content flash in Firefox
 * @returns {function(*): function(ReactElement): *}
 */
const withCSS = (paths, firefox = true) => (BaseComponent) =>
  class CSS extends React.Component {
    constructor(props) {
      super(props);
      let hrefs = paths;
      if (!isProd && module.hot && loadedChunks && loadedChunks.size > paths.length) {
        loadedChunks.clear();
      }

      if (!loadedChunks || loadedChunks.size < 1) {
        loadedChunks = new Set(hrefs);
      } else {
        hrefs = hrefs.filter(pathNotLoaded);
      }
      this.state = { hrefs };
    }

    componentWillUnmount() {
      if (!isProd && module.hot) {
        return;
      }
      this.state.hrefs.forEach((path) => loadedChunks.delete(path));
    }

    render() {
      return (
        <>
          {this.state.hrefs.map((href) => <link rel="stylesheet" href={href} key={href} />)}
          {firefox && isProd ? script : null}
          <BaseComponent {...this.props} />
        </>
      );
    }
  };

module.exports = withCSS;
