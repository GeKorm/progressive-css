const React = require('react');
const hoistStatics  = require('hoist-non-react-statics');

const isProd = process.env.NODE_ENV == 'production';
// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{ __html: ' ' }} />;
const loadedChunks = new Set();

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
      const hrefs = [...new Set(paths)].filter((path) => {
        const hasPath = loadedChunks.has(path);
        if (!hasPath) loadedChunks.add(path);

        return !hasPath;
      });
      this.state = { hrefs };
    }

    componentWillUnmount() {
      this.state.hrefs.forEach((path) => loadedChunks.delete(path));
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
