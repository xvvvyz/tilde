  const $ = {
    bodyClassAdd: c => $.el('body').classList.add(c),
    bodyClassHas: c => $.el('body').classList.contains(c),
    bodyClassRemove: c => $.el('body').classList.remove(c),
    el: s => document.querySelector(s),
    els: s => [].slice.call(document.querySelectorAll(s) || []),
    escapeRegex: s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
    ieq: (a, b) => a.toLowerCase() === b.toLowerCase(),
    iin: (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) !== -1,
    isDown: e => ['c-n', 'down', 'tab'].includes($.key(e)),
    isRemove: e => ['backspace', 'delete'].includes($.key(e)),
    isUp: e => ['c-p', 'up', 's-tab'].includes($.key(e)),

    jsonp: url => {
      let script = document.createElement('script');
      script.src = url;
      $.el('head').appendChild(script);
    },

    key: e => {
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;

      switch (e.which) {
        case 8: return 'backspace';
        case 9: return shift ? 's-tab' : 'tab';
        case 13: return 'enter';
        case 16: return 'shift';
        case 17: return 'ctrl';
        case 18: return 'alt';
        case 27: return 'escape';
        case 38: return 'up';
        case 40: return 'down';
        case 46: return 'delete';
        case 78: return ctrl ? 'c-n' : 'n';
        case 80: return ctrl ? 'c-p' : 'n';
        case 91: return 'super';
        case 191: return shift ? '?' : '/';
      }
    },
  };

  class Clock {
    constructor({ delimiter }) {
      this._el = $.el('#clock');
      this._delimiter = delimiter;
      this._setTime = this._setTime.bind(this);
      this._start();
    }

    _pad(num) {
      return ('0' + num.toString()).slice(-2);
    }

    _setTime() {
      const date = new Date();
      const hours = this._pad(date.getHours());
      const minutes = this._pad(date.getMinutes());
      this._el.innerHTML = hours + this._delimiter + minutes;
    }

    _start() {
      this._setTime();
      setInterval(this._setTime, 1000);
    }
  }

  class Help {
    constructor(options) {
      this._el = $.el('#help');
      this._commands = options.commands;
      this._newTab = options.newTab;
      this._toggled = false;
      this._buildAndAppendLists();
      this._bindMethods();
      this._registerEvents();
    }

    toggle(show) {
      this._toggled = (typeof show !== 'undefined') ? show : !this._toggled;
      this._toggled ? $.bodyClassAdd('help') : $.bodyClassRemove('help');
    }

    _bindMethods() {
      this._handleKeydown = this._handleKeydown.bind(this);
    }

    _buildAndAppendLists() {
      const lists = document.createElement('ul');
      lists.classList.add('categories');

      this._getCategories().forEach(category => {
        lists.insertAdjacentHTML(
          'beforeend',
          `<li class="category">
            <h2 class="category-name">${category}</h2>
            <ul>${this._buildListCommands(category)}</ul>
          </li>`
        );
      });

      this._el.appendChild(lists);
    }

    _buildListCommands(category) {
      return this._commands.map(([cmdCategory, name, key, url]) => {
        if (cmdCategory === category) {
          return (
            `<li class="command">
              <a href="${url}" target="${this._newTab ? '_blank' : '_self'}">
                <span class="command-key">${key}</span>
                <span class="command-name">${name}</span>
              </a>
            </li>`
          );
        }
      }).join('');
    }

    _getCategories() {
      const categories = this._commands
        .map(([category]) => category)
        .filter(category => category);

      return [...new Set(categories)];
    }

    _handleKeydown(e) {
      if ($.key(e) === 'escape') this.toggle(false);
    }

    _registerEvents() {
      document.addEventListener('keydown', this._handleKeydown);
    }
  }

  class Influencer {
    constructor(options) {
      this._limit = options.limit;
      this._queryParser = options.queryParser;
    }

    addItem() {}
    getSuggestions() {}

    _addSearchPrefix(items, query) {
      const searchPrefix = this._getSearchPrefix(query)
      return items.map(s => searchPrefix ? searchPrefix + s : s);
    }

    _getSearchPrefix(query) {
      const { isSearch, key, split } = this._parseQuery(query);
      return isSearch ? `${key}${split} ` : false;
    }

    _parseQuery(query) {
      return this._queryParser.parse(query);
    }
  }

  class DefaultInfluencer extends Influencer {
    constructor({ defaultSuggestions }) {
      super(...arguments);
      this._defaultSuggestions = defaultSuggestions;
    }

    getSuggestions(query) {
      return new Promise(resolve => {
        const suggestions = this._defaultSuggestions[query];
        resolve(suggestions ? suggestions.slice(0, this._limit) : []);
      });
    }
  }

  class DuckDuckGoInfluencer extends Influencer {
    constructor({ queryParser }) {
      super(...arguments);
    }

    getSuggestions(rawQuery) {
      const { query } = this._parseQuery(rawQuery);
      if (!query) return Promise.resolve([]);

      return new Promise(resolve => {
        const endpoint = 'https://duckduckgo.com/ac/';
        const callback = 'autocompleteCallback';

        window[callback] = res => {
          const suggestions = res.map(i => i.phrase)
            .filter(s => !$.ieq(s, query))
            .slice(0, this._limit)

          resolve(this._addSearchPrefix(suggestions, rawQuery));
        };

        $.jsonp(`${endpoint}?callback=${callback}&q=${query}`);
      });
    }
  }

  class HistoryInfluencer extends Influencer {
    constructor() {
      super(...arguments);
      this._storeName = 'history';
    }

    addItem(query) {
      if (query.length < 2) return;
      let exists;

      const history = this._getHistory().map(([item, count]) => {
        const match = $.ieq(item, query);
        if (match) exists = true;
        return [item, match ? count + 1 : count];
      });

      if (!exists) history.push([query, 1]);
      this._setHistory(this._sort(history));
    }

    getSuggestions(query) {
      return new Promise(resolve => {
        const suggestions = this._getHistory()
          .map(([item]) => item)
          .filter(item => this._itemContainsQuery(query, item))
          .slice(0, this._limit);

        resolve(suggestions);
      });
    }

    _fetch() {
      return JSON.parse(localStorage.getItem(this._storeName)) || [];
    }

    _getHistory() {
      this._history = this._history || this._fetch();
      return this._history;
    }

    _itemContainsQuery(query, item) {
      return query && !$.ieq(item, query) && $.iin(item, query);
    }

    _save(history) {
      localStorage.setItem(this._storeName, JSON.stringify(history));
    }

    _setHistory(history) {
      this._history = history;
      this._save(history);
    }

    _sort(history) {
      return history.sort((current, next) => current[1] - next[1]).reverse();
    }
  }

  class Suggester {
    constructor(options) {
      this._el = $.el('#search-suggestions');
      this._influencers = options.influencers;
      this._limit = options.limit;
      this._suggestionEls = [];
      this._bindMethods();
      this._registerEvents();
    }

    setOnClick(callback) {
      this._onClick = callback;
    }

    setOnHighlight(callback) {
      this._onHighlight = callback;
    }

    setOnUnhighlight(callback) {
      this._onUnhighlight = callback;
    }

    success(query) {
      this._clearSuggestions();
      this._influencers.forEach(i => i.addItem(query));
    }

    suggest(input) {
      input = input.trim();
      if (input === '') this._clearSuggestions();

      Promise.all(this._getInfluencerPromises(input)).then(res => {
        const suggestions = this._flattenAndUnique(res);
        this._clearSuggestions();

        if (suggestions.length) {
          this._appendSuggestions(suggestions, input);
          this._registerSuggestionEvents();
          $.bodyClassAdd('suggestions');
        }
      });
    }

    _appendSuggestions(suggestions, input) {
      suggestions.some((suggestion, i) => {
        const match = new RegExp($.escapeRegex(input), 'ig');
        const suggestionHtml = suggestion.replace(match, `<b>${input}</b>`);

        this._el.insertAdjacentHTML(
          'beforeend',
          `<li>
            <button
              type="button"
              class="js-search-suggestion search-suggestion"
              data-suggestion="${suggestion}"
              tabindex="-1"
            >
              ${suggestionHtml}
            </button>
          </li>`
        );

        return i + 1 >= this._limit;
      });

      this._suggestionEls = $.els('.js-search-suggestion');
    }

    _bindMethods() {
      this._handleKeydown = this._handleKeydown.bind(this);
    }

    _clearClickEvents() {
      this._suggestionEls.forEach(el => {
        const callback = this._onClick.bind(null, el.value);
        el.removeEventListener('click', callback);
      });
    }

    _clearSuggestions() {
      $.bodyClassRemove('suggestions');
      this._clearClickEvents();
      this._suggestionEls = [];
      this._el.innerHTML = '';
    }

    // [[1, 2], [1, 2, 3, 4]] -> [1, 2, 3, 4]
    _flattenAndUnique(array) {
      return [...new Set([].concat.apply([], array))];
    }

    _focusNext(e) {
      const exists = this._suggestionEls.some((el, i) => {
        if (el.classList.contains('highlight')) {
          this._highlight(this._suggestionEls[i + 1], e);
          return true;
        }
      });

      if (!exists) this._highlight(this._suggestionEls[0], e);
    }

    _focusPrevious(e) {
      const exists = this._suggestionEls.some((el, i) => {
        if (el.classList.contains('highlight') && i) {
          this._highlight(this._suggestionEls[i - 1], e);
          return true;
        }
      });

      if (!exists) this._unHighlight(e);
    }

    _getInfluencerPromises(input) {
      return this._influencers
        .map(influencer => influencer.getSuggestions(input));
    }

    _handleKeydown(e) {
      if ($.isDown(e)) this._focusNext(e);
      if ($.isUp(e)) this._focusPrevious(e);
    }

    _highlight(el, e) {
      this._unHighlight();

      if (el) {
        this._onHighlight(el.getAttribute('data-suggestion'));
        el.classList.add('highlight');
        e.preventDefault();
      }
    }

    _registerEvents() {
      document.addEventListener('keydown', this._handleKeydown);
    }

    _registerSuggestionEvents() {
      this._suggestionEls.forEach(el => {
        const value = el.getAttribute('data-suggestion');
        el.addEventListener('mouseover', this._highlight.bind(this, el));
        el.addEventListener('mouseout', this._unHighlight.bind(this));
        el.addEventListener('click', this._onClick.bind(null, value));
      });
    }

    _unHighlight(e) {
      const el = $.el('.highlight');

      if (el) {
        this._onUnhighlight();
        el.classList.remove('highlight');
        if (e) e.preventDefault();
      }
    }
  }

  class QueryParser {
    constructor(options) {
      this._commands = options.commands;
      this._searchDelimiter = options.searchDelimiter;
      this._pathDelimiter = options.pathDelimiter;
      this._protocolRegex = /^[a-zA-Z]+:\/\//i;
      this._urlRegex = /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)$/i;
    }

    parse(query) {
      const res = { query: query, split: null };

      if (query.match(this._urlRegex)) {
        const hasProtocol = query.match(this._protocolRegex);
        res.redirect = hasProtocol ? query : 'http://' + query;
      } else {
        const splitSearch = query.split(this._searchDelimiter);
        const splitPath = query.split(this._pathDelimiter);

        this._commands.some(([category, name, key, url, searchPath]) => {
          res.isKey = query === key;
          res.isSearch = !res.isKey && splitSearch[0] === key;
          res.isPath = !res.isKey && splitPath[0] === key;

          if (res.isKey || res.isSearch || res.isPath) {
            res.key = key;

            if (res.isSearch && searchPath) {
              res.split = this._searchDelimiter;
              res.query = this._shiftAndTrim(splitSearch, res.split);
              res.redirect = this._prepSearch(url, searchPath, res.query);
            } else if (res.isPath) {
              res.split = this._pathDelimiter;
              res.path = this._shiftAndTrim(splitPath, res.split);
              res.redirect = this._prepPath(url, res.path);
            } else {
              res.redirect = url;
            }

            return true;
          }

          if (key === '*') {
            res.redirect = this._prepSearch(url, searchPath, query);
          }
        });
      }

      res.color = this._getColorFromUrl(res.redirect);
      return res;
    }

    _getColorFromUrl(url) {
      const domain = this._getHostname(url);
      const color = this._commands
        .filter(c => this._getHostname(c[3]) === domain)
        .map(c => c[5])[0];

      return color || null;
    }

    _getHostname(url) {
      const parser = document.createElement('a');
      parser.href = url;
      return parser.hostname.replace(/^www./, '');
    }

    _prepPath(url, path) {
      return this._stripUrlPath(url) + '/' + path;
    }

    _prepSearch(url, searchPath, query) {
      if (!searchPath) return url;
      const baseUrl = this._stripUrlPath(url);
      const urlQuery = encodeURIComponent(query);
      searchPath = searchPath.replace('{}', urlQuery);
      return baseUrl + searchPath;
    }

    _shiftAndTrim(arr, delimiter) {
      arr.shift();
      return arr.join(delimiter).trim();
    }

    _stripUrlPath(url) {
      const parser = document.createElement('a');
      parser.href = url;
      return `${parser.protocol}//${parser.hostname}`;
    }
  }

  class Form {
    constructor(options) {
      this._formEl = $.el('#search-form');
      this._inputEl = $.el('#search-input');
      this._colors = options.colors;
      this._help = options.help;
      this._suggester = options.suggester;
      this._queryParser = options.queryParser;
      this._instantRedirect = options.instantRedirect;
      this._newTab = options.newTab;
      this._inputElVal = '';
      this._bindMethods();
      this._registerEvents();
    }

    _bindMethods() {
      this._clearPreview = this._clearPreview.bind(this);
      this._handleKeydown = this._handleKeydown.bind(this);
      this._handleKeypress = this._handleKeypress.bind(this);
      this._handleKeyup = this._handleKeyup.bind(this);
      this._previewValue = this._previewValue.bind(this);
      this._submitForm = this._submitForm.bind(this);
      this._submitWithValue = this._submitWithValue.bind(this);
    }

    _clearInput() {
      this._inputEl.value = '';
      this._inputElVal = '';
      $.bodyClassRemove('form');
    }

    _clearPreview() {
      this._inputEl.value = this._inputElVal;
      this._inputEl.focus();
      this._setBackgroundFromQuery(this._inputElVal);
    }

    _handleKeydown(e) {
      if ($.isUp(e) || $.isDown(e) || $.isRemove(e)) return;

      switch ($.key(e)) {
        case 'alt':
        case 'ctrl':
        case 'enter':
        case 'shift':
        case 'super': return;
        case 'escape': this._clearInput(); return;
        case '?': if (!$.bodyClassHas('form')) this._help.toggle(); return;
      }

      $.bodyClassAdd('form');
      this._inputEl.focus();
    }

    _handleKeypress(e) {
      const newChar = String.fromCharCode(e.which);
      const newQuery = this._inputEl.value + newChar;
      const validChar = newChar.length && $.key(e) !== 'enter';
      const queryDiffers = this._inputElVal !== newQuery;
      const { isKey, color } = this._queryParser.parse(newQuery);
      this._setBackground(color);

      if (this._instantRedirect && isKey) {
        e.preventDefault();
        this._submitWithValue(newQuery);
      } else if (this._suggester && validChar && queryDiffers) {
        this._suggester.suggest(newQuery);
        this._inputElVal = newQuery;
      }
    }

    _handleKeyup(e) {
      const newQuery = this._inputEl.value;
      const queryDiffers = this._inputElVal !== newQuery;
      this._setBackgroundFromQuery(newQuery);

      if (!newQuery) {
        $.bodyClassRemove('form');
      } else if (this._suggester && $.isRemove(e) && queryDiffers) {
        this._suggester.suggest(newQuery);
        this._inputElVal = newQuery;
      }
    }

    _previewValue(value) {
      this._inputEl.value = value;
      this._setBackgroundFromQuery(value);
    }

    _redirect(redirect) {
      if (this._newTab) window.open(redirect, '_blank');
      else window.location.href = redirect;
    }

    _registerEvents() {
      document.addEventListener('keydown', this._handleKeydown);
      this._inputEl.addEventListener('keypress', this._handleKeypress);
      this._inputEl.addEventListener('keyup', this._handleKeyup);
      this._formEl.addEventListener('submit', this._submitForm, false);

      if (this._suggester) {
        this._suggester.setOnClick(this._submitWithValue);
        this._suggester.setOnHighlight(this._previewValue);
        this._suggester.setOnUnhighlight(this._clearPreview);
      }
    }

    _setBackground(color) {
      this._formEl.style.backgroundColor = color;
    }

    _setBackgroundFromQuery(query) {
      if (this._colors) {
        this._setBackground(this._queryParser.parse(query).color);
      }
    }

    _submitForm(e) {
      if (e) e.preventDefault();
      const query = this._inputEl.value;
      if (this._suggester) this._suggester.success(query);
      this._clearInput();
      this._redirect(this._queryParser.parse(query).redirect);
    }

    _submitWithValue(value) {
      this._inputEl.value = value;
      this._submitForm();
    }
  }

  const getHelp = () => {
    return new Help({
      commands: CONFIG.commands,
      newTab: CONFIG.newTab,
    });
  };

  const getInfluencers = () => {
    const availableInfluencers = {
      Default: DefaultInfluencer,
      DuckDuckGo: DuckDuckGoInfluencer,
      History: HistoryInfluencer,
    };

    return CONFIG.influencers.map(i => {
      return new availableInfluencers[i.name]({
        limit: i.limit,
        queryParser: getQueryParser(),
        defaultSuggestions: CONFIG.defaultSuggestions,
      });
    });
  };

  const getSuggester = () => {
    return new Suggester({
      influencers: getInfluencers(),
      limit: CONFIG.suggestionsLimit,
    });
  };

  const getQueryParser = () => {
    return new QueryParser({
      commands: CONFIG.commands,
      pathDelimiter: CONFIG.pathDelimiter,
      searchDelimiter: CONFIG.searchDelimiter,
    });
  };

  new Clock({
    delimiter: CONFIG.clockDelimiter,
  });

  new Form({
    colors: CONFIG.colors,
    help: getHelp(),
    instantRedirect: CONFIG.instantRedirect,
    newTab: CONFIG.newTab,
    queryParser: getQueryParser(),
    suggester: CONFIG.suggestions ? getSuggester() : false,
  });
