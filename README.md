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

Add the babel plugin

###### .babelrc
```
"plugins": [
  // ... other plugins,
  ["progressive-css/babel-plugin", { root: "./", isProd: process.env.NODE_ENV === 'production' }]
]
```

###### Output (production):
```html
<link rel="stylesheet" href="/styles/normalize.css" />
<link rel="stylesheet" href="/styles/Awesome.h4sh3d.min.css" />
<script> </script>
<div class="hello">Hello World</div>
```

During development it will point to /styles/Awesome.css instead.

### API

#### React
`const __CSS__ = string[]` Paths to stylesheets, resolved as `<link href="path" />`
**MUST** be named `__CSS__` if using the babel plugin, with a static value (not imported).
A path can contain a glob but must be dot-delimited.

`withCSS(__CSS__, scriptBlock: boolean = true)(Component);`
If `scriptBlock` is false, then it won't inject empty script tags to work around Firefox Flash Of Unstyled Content

##### Server-side rendering
**flushCSS()**  

If you perform server-side rendering you must let progressive-css know when to flush its CSS chunks. This is usually every
time you call the reactDomServer methods (eg renderToString())

Example
```jsx
// server-render.js

import React from 'react';
import { renderToString } from 'react-dom/server';
import { flushCSS } from 'progressive-css'

const getPage = (req, res) => {
   const toRender = renderToString(<App />);
   flushCSS();
   
   const result = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8">
    <title>Example</title>
  </head>
  <body>
    <div id="root">${toRender}</div>
  </body>
</html>
`;

   res.status(200).send(result);
}
```

**flushCSS()** returns an array of the loaded CSS paths that were cleared, which you can optionally be used
for things like preloading.

###### Example: preload the first 3 css chunks
```jsx
   const toRender = renderToString(<App />);
   const cssChunks = flushCSS();
   
   const result = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8">
    <title>Example</title>
    ${
      cssChunks && cssChunks[0]
        ? cssChunks
            .slice(0, 3)
            .map((href) => `<link rel="preload" href="${href}" as="style">`)
            .join('\n')
        : ''
    }
  </head>
  <body>
    <div id="root">${toRender}</div>
  </body>
</html>
`;
```

#### Babel
```javascript
const defaultOptions = {
  root: './', // All CSS paths are resolved relative to this
  isProd: false, // Enable to turn on file discovery and glob matching
  replaceDir: undefined // [regexp|substr, newSubstr|function] Applies string.replace() to the directories
}
```

Should be the last plugin. The css is resolved relative to `./` unless the `root` option specifies otherwise.
**In production** you must specify `isProd: true`.  
`replaceDir` is useful for separating your production CSS files. For example:


`replaceDir: ['/styles/', '/dist/']` turns  
`['/styles/normalize.css', '/styles/Awesome.*.*.css'];`  
into  
`['/dist/normalize.css', '/dist/Awesome.*.*.css'];`


### SSR
Server-side rendering works out of the box using the provided babel plugin.
