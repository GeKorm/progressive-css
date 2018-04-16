const nodePath  = require('path');
const filehound = require('filehound');

const pathMatcher = /(.*\/|.*\\)?([^\/\\]+)/;

class StylePath {
  constructor(path) {
    [this.directory, this.filename] = path.match(pathMatcher).slice(1);
  }

  get path() {
    return this.directory + this.filename;
  }
}

module.exports = function(babel) {
  const { types: t } = babel;
  const isProd = process.env.NODE_ENV === 'production';
  const hound = isProd && filehound.create();
  return {
    name: 'progressive-css', // not required
    visitor: {
      VariableDeclarator(path, state) {
        const options = state.opts;
        if (path.node.id.name === '__CSS__') {
          const hrefs = path.node.init.elements;
          hrefs.forEach((element) => {
            let href = element.value;
            if (!isProd) {
              element.value = href.replace(/\*\./g, '');
              return;
            }
            if (isProd && href.includes('*')) {
              const stylePath = new StylePath(href);
              const found = hound
                .path(nodePath.join(options.root || './', stylePath.directory))
                .glob(stylePath.filename)
                .ignoreHiddenFiles()
                .findSync()[0];
              stylePath.filename = found && found.match(pathMatcher)[2];

              // return stylePath.path;
              element.value = stylePath.path;
            }
          });
        }
      }
    }
  };
};
