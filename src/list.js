'use strict';

var dom = require('./dom.js');
var render = require('./render.js');
var util = require('./util.js');

module.exports = {
  create: createList,
};

function createList(context, options) {
  var loadMore;
  var loading;
  var list;
  var noResults;
  var items = [];
  context.container.innerHTML = '<ul' +
    (options.css.list ? ' class="' + options.css.list + '"' : '') +
    '></ul>';
  list = context.container.children[0];

  return {
    push: pushItem,
    clean: cleanItems,
    items: items,
    getByData: getByData,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showLoadMore: showLoadMore,
    showNoResults: showNoResults,
    hasMoreItems: hasMoreItems,
  };

  function pushItem(info, search) {
    var regExp;
    var itemElem = appendElement(options.templates.item, options.css.item, info);
    var item = { data: info, element: itemElem };

    if (search) {
      regExp = util.queryRegExp(search);
      itemElem.innerHTML = itemElem.innerHTML.replace(regExp, highlight);
    }

    itemElem.addEventListener('mousedown', function (e) {
      context.emit('change', info, itemElem);
    });

    hideLoading();
    list.appendChild(itemElem);
    items.push(item);
  }

  function highlight(str) {
    return '<span' +
      (options.css.match ? ' class="' + options.css.match + '"' : '') +
      '>' +
      str +
      '</span>';
  }

  function cleanItems() {
    items.splice(0, items.length);
    list.innerHTML = '';
    loadMore = null;
    loading = null;
    noResults = null;
  }

  function getByData(data) {
    return items.filter(function (item) { return item.data === data; })[0];
  }

  function showLoading(query) {
    hideLoadMore();
    hideNoResults();

    if (!loading) {
      loading = appendElement(options.templates.loading, options.css.loading, query);
    }

    return loading;
  }

  function hideLoading() {
    if (loading) {
      list.removeChild(loading);
      loading = null;
    }
  }

  function showLoadMore(result) {
    hideLoading();

    if (!loadMore) {
      loadMore = appendElement(options.templates.loadMore, options.css.loadMore, result);
    }

    if (!options.showLoadMore) {
      dom.addClass(loadMore, options.css.hide);
    }

    return loadMore;
  }

  function hideLoadMore() {
    if (loadMore) {
      list.removeChild(loadMore);
      loadMore = null;
    }
  }

  function showNoResults(result) {
    hideLoading();

    if (!loadMore) {
      noResults = appendElement(options.templates.noResults, options.css.noResults, result);
    }
  }

  function hideNoResults() {
    if (noResults) {
      list.removeChild(noResults);
      noResults = null;
    }
  }

  function hasMoreItems() {
    return !!(loadMore || loading);
  }

  function appendElement(template, className, obj) {
    var element = document.createElement('li');
    element.innerHTML = (options.includeAnchors ? '<a>' : '') +
      render(template, obj, true) +
      (options.includeAnchors ? '</a>' : '');
    element.className = className || '';
    list.appendChild(element);

    return element;
  }
}
