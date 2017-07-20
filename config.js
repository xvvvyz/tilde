  const CONFIG = {

    // the category, name, key, url, search path and color for your commands
    // if none of the specified keys are matched, the '*' key is used
    commands: [
      [null, 'Google', '*', 'https://google.com', '/search?q={}', '#111'],
      ['Work', 'Analytics', 'a', 'https://analytics.google.com', null, '#ff6d00'],
      ['Work', 'GitHub', 'g', 'https://github.com', '/search?q={}', '#333'],
      ['Work', 'Inbox', 'I', 'https://inbox.google.com', '/search/{}', '#4285f4'],
      ['Work', 'Keep', 'k', 'https://keep.google.com', '/#search/text={}', '#fb0'],
      ['Look', 'Codrops', 'C', 'https://tympanus.net/codrops', '?search-type=posts&s={}', '#0099cc'],
      ['Look', 'Hunt', 'H', 'https://www.producthunt.com', '/search?q={}', '#da552f'],
      ['Look', 'Photos', 'P', 'https://photos.google.com', '/search/{}', '#34a853'],
      ['Look', 'Unsplash', 'u', 'https://unsplash.com/new', '/search/{}', '#000'],
      ['Lurk', 'Facebook', 'f', 'https://www.facebook.com', '/search/top/?q={}', '#3b5998'],
      ['Lurk', 'Instagram', 'i', 'https://www.instagram.com', false, '#833ab4'],
      ['Lurk', 'Reddit', 'r', 'https://www.reddit.com', '/search?q={}', '#5f99cf'],
      ['Lurk', 'Twitter', 't', 'https://twitter.com', '/search?q={}', '#1da1f2'],
      ['Listen', 'Hypem', 'h', 'https://hypem.com/popular', '/search/{}', '#83c441'],
      ['Listen', 'Line Radio', 'l', 'https://linerad.io', '/#{}', '#39CCCC'],
      ['Listen', 'Pandora', 'p', 'https://www.pandora.com', '/artist/{}', '#005483'],
      ['Listen', 'SoundCloud', 's', 'https://soundcloud.com/discover', '/search?q={}', '#ff8800'],
      ['Watch', 'Academy', 'A', 'https://www.khanacademy.org/', '/search?page_search_query={}', '#9cb443'],
      ['Watch', 'Netflix', 'n', 'https://www.netflix.com/browse', '/search?q={}', '#e50914'],
      ['Watch', 'Twitch', 'T', 'https://www.twitch.tv/directory/following', null, '#6441a5'],
      ['Watch', 'YouTube', 'y', 'https://youtube.com/feed/subscriptions', '/results?search_query={}', '#cd201f'],
      ['Download', '7digital', '7', 'https://us.7digital.com', '/search?q={}', '#07606e'],
      ['Download', 'Sky Torrents', 'S', 'https://skytorrents.in', '/search/all/ed/1?q={}', '#00d1b2'],
      ['Download', 'The Pirate Bay', 'b', 'https://thepiratebay.org', '/search/{}', '#4c4132'],
      ['Download', 'YTS', 'Y', 'https://yts.ag/browse-movies/0/1080p/all/7/latest', '/browse-movies/{}/1080p/all/0/rating', '#2f2f2f'],
    ],

    // give suggestions as you type
    suggestions: true,

    // max amount of suggestions that will ever be displayed
    suggestionsLimit: 5,

    // the order and limit for each suggestion influencer
    // "Default" suggestions come from CONFIG.defaultSuggestions
    // "DuckDuckGo" suggestions come from the duck duck go search api
    // "History" suggestions come from your previously entered queries
    influencers: [
      { name: 'Default', limit: 5 },
      { name: 'History', limit: 2 },
      { name: 'DuckDuckGo', limit: 5 },
    ],

    // default search suggestions for the specified queries
    defaultSuggestions: {
      'g': ['g/issues', 'g/pulls', 'gist.github.com', 'g/pschfr', 'g/pschfr/tilde'],
      'l': ['l:electronic', 'l:chill', 'l:focus', 'l:sleep', 'l:ambient'],
      'r': ['r/r/unixporn', 'r/r/startpages', 'r/r/webdev', 'r/r/technology', 'r/r/pittsburgh'],
      's': ['s/you/likes', 's/discover/the-upload'],
    },

    // instantly redirect when a key is matched
    // put a space before any other queries to prevent unwanted redirects
    instantRedirect: false,

    // open queries in a new tab
    newTab: true,

    // dynamic background colors when command domains are matched
    colors: true,

    // the delimiter between the key and your search query
    // e.g. to search GitHub for potatoes you'd type "g:potatoes"
    searchDelimiter: ':',

    // the delimiter between the key and a path
    // e.g. type "r/r/unixporn" to go to "reddit.com/r/unixporn"
    pathDelimiter: '/',

    // the delimiter between the hours and minutes in the clock
    clockDelimiter: ':',
  };
