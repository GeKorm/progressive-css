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

  if (!global.__CSS_CHUNKS_LOADED__) {
    // Dedupe stylesheets
    global.__CSS_CHUNKS_LOADED__ = [];
  }

  if (global.__CSS_CHUNKS_LOADED__.length < 1) {
    global.__CSS_CHUNKS_LOADED__ = [...hrefs];
  } else {
    hrefs = hrefs.filter((path) => !global.__CSS_CHUNKS_LOADED__.includes(path));
    if (hrefs.length > 0) global.__CSS_CHUNKS_LOADED__.push(...hrefs);
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
