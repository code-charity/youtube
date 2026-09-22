<br>


# Hi! 
<br>
Welcome to work! ("issues")

### https://github.com/code-charity/youtube/wiki/Contributing
you can also just check the (pinned-)issues(, readme & discussion, wiki, ..)  <br><br>
### Thanks for caring ♥


### Settings restore regression tests

Run `npx jest --runInBand tests/unit/settings-import.test.js` to check file and
browser-account restores with a delayed storage callback. Restores must wait for
the batch write before updating the cache, notifying listeners, or closing the
importer. A successful restore emits `storage-set` after populating the cache so
the open menu refreshes its theme and visibility attributes through the listener
in `menu/index.js`. Storage errors must leave the cache and importer unchanged.
