# progressive-css
The future of loading CSS in React applications

Serve **only the CSS you need**, with **no runtime overhead** leveraging **HTTP2**. Because performance matters.
More info: https://jakearchibald.com/2016/link-in-body/

[Slow connection demo]( https://jakearchibald-demos.herokuapp.com/progressive-css/) (thanks Jake Archibald)
Notice how reloading is instant.

### Install

- Yarn: `yarn add progressive-css`
- Npm: `npm i progressive-css`

### Example usage:

###### Awesome.js
```jsx harmony
import React, { Component } from 'react';
import withCSS from 'progressive-css';

// Must be named __CSS__ and cannot import its value
const __CSS__ = ['/styles/normalize.css', '/styles/Awesome.*.*.css'];

class Awesome extends Component {
  render() {
    return <div className="hello">Hello World</div>;
  }
}

export default withCSS(__CSS__)(Awesome);
```

Add the loader in your webpack config

###### webpack.config.js
```javascript
const config = {
  module: {
    rules: [
      ...,
      { // Should be the last loader
        test: /\.(js|jsx|ts|tsx)$/,
        use: [{ loader: 'progressive-css/loader' }]
      }
    ]
  }
};

module.exports = config;
```

###### Output (production):
```html
<link rel="stylesheet" href="/styles/normalize.css" />
<link rel="stylesheet" href="/styles/Awesome.h4sh3d.min.css" />
<script> </script>
<div className="hello">Hello World</div>
```

During development it will point to /styles/Awesome.css instead.

### API

**React:**
`const __CSS__ = string[]` Paths to stylesheets, resolved as `<link href="path" />`
**MUST** be named `__CSS__` if using the webpack loader, with a static value (not imported).
A path can contain a glob but must be dot-delimited.

`withCSS(__CSS__, firefox: boolean = true)(Component);`
If `firefox` is false, then it won't inject empty script tags to work around Firefox Flash Of Unstyled Content

**Webpack:**
Should be the last loader. The css is resolved relative to webpack's `module.output.path` unless `options` is defined
```javascript
const config = {
  module: {
    rules: [{
      test: /\.(js|jsx|ts|tsx)$/,
      use: [{
        loader: 'progressive-css/loader',
        options: { // OPTIONAL
          root: path.resolve(__dirname, './my/custom/root')
        }
      }]
    }]
  }
};
```
