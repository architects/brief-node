'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = attacher;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

function attacher(mdast, options) {
  return function transformer(ast) {
    var headingIndex = 0;
    var headings = ast.children.filter(function (c) {
      return c.type === "heading";
    });

    headings.forEach(function (c) {
      var htmlAttributes = {};

      htmlAttributes['data-line-number'] = c.position.start.line;

      c.data = c.data || {};
      c.data.htmlAttributes = htmlAttributes;

      c.headingIndex = ++headingIndex;
    });
  };
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHJ1Y3R1cmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7cUJBRXdCLFFBQVE7Ozs7OEJBRmQsa0JBQWtCOzs7O0FBRXJCLFNBQVMsUUFBUSxDQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDaEQsU0FBTyxTQUFTLFdBQVcsQ0FBRSxHQUFHLEVBQUU7QUFDaEMsUUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFBO0FBQ3BCLFFBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQzthQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUztLQUFBLENBQUMsQ0FBQTs7QUFFN0QsWUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUNwQixVQUFJLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXZCLG9CQUFjLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7O0FBRTFELE9BQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7QUFDckIsT0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBOztBQUV0QyxPQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsWUFBWSxDQUFBO0tBQ2hDLENBQUMsQ0FBQTtHQUNILENBQUE7Q0FDRiIsImZpbGUiOiJzdHJ1Y3R1cmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdmlzaXQgZnJvbSAnbWRhc3QtdXRpbC12aXNpdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXR0YWNoZXIgKG1kYXN0LCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0cmFuc2Zvcm1lciAoYXN0KSB7XG4gICAgbGV0IGhlYWRpbmdJbmRleCA9IDBcbiAgICBsZXQgaGVhZGluZ3MgPSBhc3QuY2hpbGRyZW4uZmlsdGVyKGMgPT4gYy50eXBlID09PSBcImhlYWRpbmdcIilcblxuICAgIGhlYWRpbmdzLmZvckVhY2goYyA9PiB7XG4gICAgICBsZXQgaHRtbEF0dHJpYnV0ZXMgPSB7fVxuICAgICAgXG4gICAgICBodG1sQXR0cmlidXRlc1snZGF0YS1saW5lLW51bWJlciddID0gYy5wb3NpdGlvbi5zdGFydC5saW5lXG5cbiAgICAgIGMuZGF0YSA9IGMuZGF0YSB8fCB7fVxuICAgICAgYy5kYXRhLmh0bWxBdHRyaWJ1dGVzID0gaHRtbEF0dHJpYnV0ZXNcblxuICAgICAgYy5oZWFkaW5nSW5kZXggPSArK2hlYWRpbmdJbmRleFxuICAgIH0pXG4gIH1cbn1cbiJdfQ==