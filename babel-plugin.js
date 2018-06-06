const nodePath  = require('path');
const filehound = require('filehound');

// const pathMatcher = /(.*\/|.*\\)?([^\/\\]+)/;
const applyReplace = (text, args) => args ? text.replace(...args) : text;

class StylePath {
  constructor(path, replaceDir) {
    this.filename = nodePath.basename(path);
    this.directory = path.replace(this.filename, '');
    if (replaceDir) this.directory = applyReplace(this.directory, replaceDir);
  }

  get path() {
    return this.directory + this.filename;
  }
}

module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: 'progressive-css', // not required
    visitor: {
      VariableDeclarator(path, state) {
        const options = state.opts;
        const { isProd, replaceDir, root } = options;

        if (path.node.id.name === '__CSS__') {
          const hrefs = path.node.init.elements;
          hrefs.forEach((element) => {
            let href = element.value;
            const stylePath = new StylePath(href, replaceDir);
            if (!isProd) {
              element.value = href.replace(/\*\./g, '');
              return;
            }
            if (isProd && href.includes('*')) {
              const hound = isProd && filehound.create();

              const found = hound
                .path(nodePath.join(root || './', stylePath.directory))
                .glob(stylePath.filename)
                .ignoreHiddenFiles()
                .findSync()[0];
              stylePath.filename = found && nodePath.basename(found);

              // return stylePath.path;
              element.value = stylePath.path;
            }
          });
        }
      }
    }
  };
};
