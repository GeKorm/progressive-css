const React = require('react');
const hoistStatics = require('hoist-non-react-statics');

const isProd = process.env.NODE_ENV == 'production';
// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{ __html: ' ' }} />;
const chunkMap = new Map();

function getDisplayName(WrappedComponent) {
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return name.startsWith('_') ? name.slice(1) : name;
}

function flushCSS() {
  const currentChunks = [...chunkMap.keys()];
  chunkMap.clear();

  return currentChunks;
}

function getCSS() {
  return [...chunkMap.keys()];
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

    constructor(props, context) {
      super(props, context);
      const hrefs = paths.filter((path) => {
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
        const subscribers = chunkMap.get(path);
        subscribers.shift();
        if (subscribers.length <= 0) {
          chunkMap.delete(path);
        } else {
          subscribers[0].add(path);
        }
      });
    }

    add = (path) => this.setState(({ hrefs }) => ({ hrefs: [...hrefs, path] }));

    render() {
      return (
        <>
          {this.state.hrefs.map((href) => (
            <link rel="stylesheet" type="text/css" href={href} key={href} />
          ))}
          {scriptBlock && isProd ? script : null}
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
