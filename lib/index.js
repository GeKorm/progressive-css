"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var React = require('react');

var hoistStatics = require('hoist-non-react-statics');

var isProd = process.env.NODE_ENV == 'production'; // Prevent unstyled flash in Firefox

var script = React.createElement("script", {
  dangerouslySetInnerHTML: {
    __html: ' '
  }
});
var chunkMap = new Map();
var persistedPaths = new Set();

function getDisplayName(WrappedComponent) {
  var name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return name.startsWith('_') ? name.slice(1) : name;
}

function flushCSS() {
  var currentChunks = _toConsumableArray(chunkMap.keys());

  chunkMap.clear();
  persistedPaths.clear();
  return currentChunks;
}

function getCSS() {
  return _toConsumableArray(chunkMap.keys());
}

function appendLink(path) {
  persistedPaths.add(path);
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', path);
  document.head.appendChild(link);
}
/**
 * Enhancer that places <link ref="stylesheet" ...> before your component
 *
 * @param paths {string[]} - Paths to css files relative to root. Supports
 * dot (.) delimited globs, eg: `['/css/AwesomeComponent.*.css']` will reference
 * `AwesomeComponent.css` during development and `AwesomeComponent.hash.css` if it exists in
 *   production
 * @param [scriptBlock=true] {boolean} - Inject empty script tags to prevent unstyled content flash
 *   in Firefox
 * @param [persist=false] {boolean} - Keep the CSS loaded in the DOM (useful for modals, transitions etc)
 *   etc)
 * @returns {function(*): function(ReactElement): *}
 */


var withCSS = function withCSS(paths) {
  var scriptBlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var persist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return function (BaseComponent) {
    var CSS =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(CSS, _React$Component);

      function CSS(props, context) {
        var _this;

        _classCallCheck(this, CSS);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(CSS).call(this, props, context));

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "add", function (path) {
          if (persist && persistedPaths.has(path)) {
            return;
          }

          if (!_this.state.hrefs.includes(path)) {
            _this.setState(function (_ref) {
              var hrefs = _ref.hrefs;
              return {
                hrefs: _toConsumableArray(hrefs).concat([path])
              };
            });
          }
        });

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "remove", function (path) {
          if (_this.state.hrefs.includes(path)) {
            _this.setState(function (_ref2) {
              var hrefs = _ref2.hrefs;
              return {
                hrefs: hrefs.filter(function (_) {
                  return _ !== path;
                })
              };
            });
          }
        });

        var _hrefs = paths.filter(function (path) {
          if (persistedPaths.has(path)) return false;
          var subscribers = chunkMap.get(path);

          if (subscribers) {
            subscribers.push(_assertThisInitialized(_assertThisInitialized(_this)));
          } else {
            chunkMap.set(path, [_assertThisInitialized(_assertThisInitialized(_this))]);
          }

          return !subscribers;
        });

        _this.state = {
          hrefs: _hrefs
        };
        return _this;
      }

      _createClass(CSS, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          var _this2 = this;

          paths.forEach(function (path) {
            if (persistedPaths.has(path)) return;
            if (persist) appendLink(path);
            var subscribers = chunkMap.get(path);

            if (subscribers) {
              var index = subscribers.indexOf(_this2);
              subscribers.splice(index, 1);

              if (subscribers.length <= 0) {
                chunkMap.delete(path);
              } else {
                if (persist) {
                  subscribers.forEach(function (sub) {
                    return sub.remove(path);
                  });
                  return;
                }

                subscribers[0].add(path);
              }
            }
          });
        }
      }, {
        key: "render",
        value: function render() {
          var _this$state;

          var hrefs = (_this$state = this.state) === null || _this$state === void 0 ? void 0 : _this$state.hrefs;
          return React.createElement(React.Fragment, null, hrefs && hrefs.length > 0 ? hrefs.map(function (href) {
            return React.createElement("link", {
              rel: "stylesheet",
              type: "text/css",
              href: href,
              key: href
            });
          }) : null, hrefs && scriptBlock && isProd ? script : null, React.createElement(BaseComponent, this.props));
        }
      }]);

      return CSS;
    }(React.Component);

    _defineProperty(CSS, "displayName", "withCSS(".concat(getDisplayName(BaseComponent), ")"));

    return hoistStatics(CSS, BaseComponent);
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flushCSS = flushCSS;
exports.getCSS = getCSS;
exports.default = withCSS;