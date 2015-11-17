"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __cache = {};

var Resolver = (function () {
  _createClass(Resolver, null, [{
    key: "create",

    /*
    * we should eliminate the caching here as it doesn't
    * make sense
    */
    value: function create(briefcase) {
      var existing = __cache[briefcase.root];
      if (existing) {
        return existing;
      }

      return __cache[briefcase.root] = new Resolver(briefcase);
    }
  }]);

  function Resolver(briefcase) {
    _classCallCheck(this, Resolver);

    __cache[briefcase.root] = this;
    this.briefcase = briefcase;
  }

  _createClass(Resolver, [{
    key: "forLinks",
    value: function forLinks(linkResolver) {
      this.linkResolver = linkResolver;
    }
  }, {
    key: "forAssets",
    value: function forAssets(assetPathResolver) {
      this.assetPathResolver = assetPathResolver;
    }
  }, {
    key: "resolveLink",
    value: function resolveLink(pathAlias) {
      if (!this.linkResolver) {
        return pathAlias;
      }

      return this.linkResolver(pathAlias);
    }
  }, {
    key: "resolveAssetPath",
    value: function resolveAssetPath(pathAlias) {
      return this.assetPathResolver(pathAlias);
    }
  }]);

  return Resolver;
})();

exports["default"] = Resolver;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNvbHZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBOztJQUVLLFFBQVE7ZUFBUixRQUFROzs7Ozs7O1dBS2QsZ0JBQUMsU0FBUyxFQUFDO0FBQ3RCLFVBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsVUFBRyxRQUFRLEVBQUU7QUFBRSxlQUFPLFFBQVEsQ0FBQTtPQUFFOztBQUVoQyxhQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDekQ7OztBQUVVLFdBWlEsUUFBUSxDQVlmLFNBQVMsRUFBQzswQkFaSCxRQUFROztBQWF6QixXQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUM5QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtHQUMzQjs7ZUFma0IsUUFBUTs7V0FpQm5CLGtCQUFDLFlBQVksRUFBQztBQUNwQixVQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtLQUNqQzs7O1dBRVEsbUJBQUMsaUJBQWlCLEVBQUM7QUFDMUIsVUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFBO0tBQzNDOzs7V0FFVSxxQkFBQyxTQUFTLEVBQUM7QUFDcEIsVUFBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUM7QUFDcEIsZUFBTyxTQUFTLENBQUE7T0FDakI7O0FBRUQsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ3BDOzs7V0FFZSwwQkFBQyxTQUFTLEVBQUM7QUFDekIsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDekM7OztTQW5Da0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoicmVzb2x2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgX19jYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc29sdmVyIHtcbiAgLypcbiAgKiB3ZSBzaG91bGQgZWxpbWluYXRlIHRoZSBjYWNoaW5nIGhlcmUgYXMgaXQgZG9lc24ndFxuICAqIG1ha2Ugc2Vuc2VcbiAgKi9cbiAgc3RhdGljIGNyZWF0ZShicmllZmNhc2Upe1xuICAgIGxldCBleGlzdGluZyA9IF9fY2FjaGVbYnJpZWZjYXNlLnJvb3RdXG4gICAgaWYoZXhpc3RpbmcpIHsgcmV0dXJuIGV4aXN0aW5nIH1cblxuICAgIHJldHVybiBfX2NhY2hlW2JyaWVmY2FzZS5yb290XSA9IG5ldyBSZXNvbHZlcihicmllZmNhc2UpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihicmllZmNhc2Upe1xuICAgIF9fY2FjaGVbYnJpZWZjYXNlLnJvb3RdID0gdGhpc1xuICAgIHRoaXMuYnJpZWZjYXNlID0gYnJpZWZjYXNlXG4gIH1cbiAgXG4gIGZvckxpbmtzKGxpbmtSZXNvbHZlcil7XG4gICAgdGhpcy5saW5rUmVzb2x2ZXIgPSBsaW5rUmVzb2x2ZXJcbiAgfVxuXG4gIGZvckFzc2V0cyhhc3NldFBhdGhSZXNvbHZlcil7XG4gICAgdGhpcy5hc3NldFBhdGhSZXNvbHZlciA9IGFzc2V0UGF0aFJlc29sdmVyXG4gIH1cblxuICByZXNvbHZlTGluayhwYXRoQWxpYXMpe1xuICAgIGlmKCF0aGlzLmxpbmtSZXNvbHZlcil7XG4gICAgICByZXR1cm4gcGF0aEFsaWFzXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGlua1Jlc29sdmVyKHBhdGhBbGlhcylcbiAgfVxuXG4gIHJlc29sdmVBc3NldFBhdGgocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5hc3NldFBhdGhSZXNvbHZlcihwYXRoQWxpYXMpXG4gIH1cbn1cbiJdfQ==