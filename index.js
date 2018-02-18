const React = require('react');

// Prevent unstyled flash in Firefox
const script = <script dangerouslySetInnerHTML={{__html: ' '}} />;

/**
 * Enhancer that places <link ref="stylesheet" ...> before your component
 *
 * @param paths {string[]} - Paths to css files relative to root. Supports
 * dot (.) delimited globs, eg: `['/css/AwesomeComponent.*.css']` will reference
 * `AwesomeComponent.css` during development and `AwesomeComponent.hash.css` if it exists in production
 * @param [firefox=true] {boolean} - Inject empty script tags to prevent unstyled content flash in Firefox
 * @returns {function(*): function(ReactElement): *}
 */
const withCSS = (paths, firefox = true) => (BaseComponent) => {
  let hrefs = paths;

  if (!global.CSS_CHUNKS_LOADED) {
    // Dedupe stylesheets
    global.CSS_CHUNKS_LOADED = {};
  }

  if (global.CSS_CHUNKS_LOADED.length < 1) {
    global.CSS_CHUNKS_LOADED = [...hrefs];
  } else {
    hrefs = hrefs.filter((path) => !global.CSS_CHUNKS_LOADED.includes(path));
    global.CSS_CHUNKS_LOADED.push(...hrefs);
  }

  return (props) => (
    <React.Fragment>
      {hrefs.map((href) => <link rel="stylesheet" href={href} key={href} />)}
      {firefox ? script : null}
      <BaseComponent {...props} />
    </React.Fragment>
  );
};

module.exports = withCSS;
