# Tilde

Inspired by [/r/startpages](https://www.reddit.com/r/startpages)—the idea is to
have a homepage for your browser that is functional and sexy.

## Basic Usage

To go to a site, enter the corresponding key. To view the available sites and
their keys, press `?`. If your input doesn't match any of the commands, a
generic Google search will be triggered. For example:

- Entering `r` would redirect you to [www.reddit.com](https://www.reddit.com).
- Entering `t` would redirect you to [twitch.tv](https://www.twitch.tv).
- Entering `cats` would search
  [Google for "cats"](https://encrypted.google.com/search?q=cats).

### Searching

You can search a site by typing a colon after the site's key, followed
by your search query. For example:

- Entering `g:tilde` would search
  [GitHub for "tilde"](https://github.com/search?q=tilde).
- Entering `s:san holo` would search
  [SoundCloud for "san holo"](https://soundcloud.com/search?q=san%20holo).

### Specific Paths

You can go to a specific path on a site by typing a forward slash after the
site's key, followed by the location on the site you'd like to be redirected to.
For example:

- Entering `r/r/startpages` would redirect you to
  [www.reddit.com/r/startpages](https://www.reddit.com/r/startpages)
- Entering `h/popular` would redirect you to
  [hypem.com/popular](http://hypem.com/popular).

### Specific Sites

If you enter in a full domain or URL, you will be redirected to said domain or
URL. For example:

- Entering `stallman.org` would redirect you to
  [stallman.org](https://stallman.org/).
- Entering `https://smile.amazon.com` would redirect you to
  [smile.amazon.com](https://smile.amazon.com/).

## Configuration

The above is just the beginning. Open up the [index.html](index.html) file and
read through the `CONFIG`!

## License

Feel free to [use this and modify it however you like](https://github.com/cadejscroggins/tilde/blob/master/LICENSE).
