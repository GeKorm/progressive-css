"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } _setPrototypeOf(subClass.prototype, superClass && superClass.prototype); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) { return o.__proto__; }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');

var hoistStatics = require('hoist-non-react-statics');

var isProd = process.env.NODE_ENV == 'production'; // Prevent unstyled flash in Firefox

var script = React.createElement("script", {
  dangerouslySetInnerHTML: {
    __html: ' '
  }
});
var loadedChunks = new Set();

function getDisplayName(WrappedComponent) {
  var name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
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


var withCSS = function withCSS(paths) {
  var scriptBlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return function (BaseComponent) {
    var CSS =
    /*#__PURE__*/
    function (_React$Component) {
      function CSS(props) {
        var _this;

        _classCallCheck(this, CSS);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(CSS).call(this, props));

        var hrefs = _toConsumableArray(new Set(paths)).filter(function (path) {
          var hasPath = loadedChunks.has(path);
          if (!hasPath) loadedChunks.add(path);
          return !hasPath;
        });

        _this.state = {
          hrefs: hrefs
        };
        return _this;
      }

      _createClass(CSS, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.state.hrefs.forEach(function (path) {
            return loadedChunks.delete(path);
          });
        }
      }, {
        key: "render",
        value: function render() {
          return React.createElement(React.Fragment, null, this.state.hrefs.map(function (href) {
            return React.createElement("link", {
              rel: "stylesheet",
              href: href,
              key: href
            });
          }), scriptBlock && isProd ? script : null, React.createElement(BaseComponent, this.props));
        }
      }]);

      _inherits(CSS, _React$Component);

      return CSS;
    }(React.Component);

    _defineProperty(CSS, "displayName", "withCSS(".concat(getDisplayName(BaseComponent), ")"));

    return hoistStatics(CSS, BaseComponent);
  };
};

module.exports = withCSS;