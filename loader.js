const path = require('path');
const filehound = require('filehound');
const evaluate = require('node-eval');
const loaderUtils = require('loader-utils');

const isProd = true || process.env.NODE_ENV === 'production';
const hound = isProd && filehound.create();

const pathMatcher = /(.*\/|.*\\)?([^\/\\]+)/;

class StylePath {
  constructor(path) {
    [this.directory, this.filename] = path.match(pathMatcher).slice(1);
  }

  get path() {
    return this.directory + this.filename;
  }
}

module.exports = function withCSS(source) {
  const start = source.indexOf('__CSS__');
  const options = loaderUtils.getOptions(this) || {};

  if (start >= 0) {
    let temp = source.substring(start + 7);
    temp = temp.substring(0, temp.indexOf(']') + 1);
    const hrefs = evaluate(`module.exports ${temp};`);

    hrefs.forEach((href) => {
      if (!isProd) {
        source = source.replace(href, href.replace(/\*\./g, ''));
        return;
      }
      if (isProd && href.includes('*')) {
        const stylePath = new StylePath(href);
        console.log(stylePath.filename);
        stylePath.filename = hound
          .path(path.join(options.root || this.options.output.path, stylePath.directory))
          .glob(stylePath.filename)
          .ignoreHiddenFiles()
          .findSync()[0]
          .match(pathMatcher)[2];

        // return stylePath.path;
        source = source.replace(href, stylePath.path);
      }
      return href;
    });
  }

  return source;
};
