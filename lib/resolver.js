'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var __cache = {};

var Resolver = (function () {
  _createClass(Resolver, null, [{
    key: 'create',
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
    key: 'forLinks',
    value: function forLinks(linkResolver) {
      this.linkResolver = linkResolver;
    }
  }, {
    key: 'forAssets',
    value: function forAssets(assetPathResolver) {
      this.assetPathResolver = assetPathResolver;
    }
  }, {
    key: 'resolveLink',
    value: function resolveLink(pathAlias) {
      if (!this.linkResolver) {
        throw 'Must supply a link resolver function. briefcase.resolver.forLinks(myFunction)';
      }

      return this.linkResolver(pathAlias);
    }
  }, {
    key: 'resolveAssetPath',
    value: function resolveAssetPath(pathAlias) {
      return this.assetPathResolver(pathAlias);
    }
  }]);

  return Resolver;
})();

exports['default'] = Resolver;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNvbHZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBOztJQUVLLFFBQVE7ZUFBUixRQUFROztXQUNkLGdCQUFDLFNBQVMsRUFBQztBQUN0QixVQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RDLFVBQUcsUUFBUSxFQUFFO0FBQUUsZUFBTyxRQUFRLENBQUE7T0FBRTs7QUFFaEMsYUFBTyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ3pEOzs7QUFFVSxXQVJRLFFBQVEsQ0FRZixTQUFTLEVBQUM7MEJBUkgsUUFBUTs7QUFTekIsV0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDOUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7R0FDM0I7O2VBWGtCLFFBQVE7O1dBYW5CLGtCQUFDLFlBQVksRUFBQztBQUNwQixVQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtLQUNqQzs7O1dBRVEsbUJBQUMsaUJBQWlCLEVBQUM7QUFDMUIsVUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFBO0tBQzNDOzs7V0FFVSxxQkFBQyxTQUFTLEVBQUM7QUFDcEIsVUFBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUM7QUFDcEIsY0FBTSwrRUFBK0UsQ0FBQztPQUN2Rjs7QUFFRCxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDcEM7OztXQUVlLDBCQUFDLFNBQVMsRUFBQztBQUN6QixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUN6Qzs7O1NBL0JrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJyZXNvbHZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCBfX2NhY2hlID0ge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb2x2ZXIge1xuICBzdGF0aWMgY3JlYXRlKGJyaWVmY2FzZSl7XG4gICAgbGV0IGV4aXN0aW5nID0gX19jYWNoZVticmllZmNhc2Uucm9vdF1cbiAgICBpZihleGlzdGluZykgeyByZXR1cm4gZXhpc3RpbmcgfVxuXG4gICAgcmV0dXJuIF9fY2FjaGVbYnJpZWZjYXNlLnJvb3RdID0gbmV3IFJlc29sdmVyKGJyaWVmY2FzZSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGJyaWVmY2FzZSl7XG4gICAgX19jYWNoZVticmllZmNhc2Uucm9vdF0gPSB0aGlzXG4gICAgdGhpcy5icmllZmNhc2UgPSBicmllZmNhc2VcbiAgfVxuICBcbiAgZm9yTGlua3MobGlua1Jlc29sdmVyKXtcbiAgICB0aGlzLmxpbmtSZXNvbHZlciA9IGxpbmtSZXNvbHZlciAgXG4gIH1cblxuICBmb3JBc3NldHMoYXNzZXRQYXRoUmVzb2x2ZXIpe1xuICAgIHRoaXMuYXNzZXRQYXRoUmVzb2x2ZXIgPSBhc3NldFBhdGhSZXNvbHZlclxuICB9XG5cbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICBpZighdGhpcy5saW5rUmVzb2x2ZXIpe1xuICAgICAgdGhyb3coJ011c3Qgc3VwcGx5IGEgbGluayByZXNvbHZlciBmdW5jdGlvbi4gYnJpZWZjYXNlLnJlc29sdmVyLmZvckxpbmtzKG15RnVuY3Rpb24pJylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5saW5rUmVzb2x2ZXIocGF0aEFsaWFzKVxuICB9XG5cbiAgcmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpe1xuICAgIHJldHVybiB0aGlzLmFzc2V0UGF0aFJlc29sdmVyKHBhdGhBbGlhcylcbiAgfVxufVxuIl19