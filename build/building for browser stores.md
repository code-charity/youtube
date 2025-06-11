## Our build script should consider these rules per browser&store (currently building manually):

### Extension name (title in manifest.js)

  - [ ] Edge & Whale deny '  (Replace ' with *) 
  - [ ] Whale denies '&' (Replace with '+')  
  - <del> (Opera removes Emoji automatically)


#### ImprovedTube:
- [ ] We can include m.youtube(?)   AND  *.youtube.com`?  AND global permission, to work for all \<video\>'s? 
  <br> besides right now only our Google Webstore version remains with www.youtube, until we announce change

Misc:
- Microsoft store has a bug/complification with languages https://github.com/code4charity/YouTube-Extension/discussions/966#discussioncomment-963315

--- 

## Previously: 

##### FIREFOX: 

- [x] Comment out PiP button in code and menu.  Or at least dont set it by defaults.
  - done in background.js 
- <del>  Version 3.2: Firefox has commented-out  // video.parentNode.parentNode.pauseVideo();  (fixes autoplay-bug)
- <del> Security: remove or comment-out:  "remote content" (googleapis.com/youtube) called as dynamic innerHtml
   - [x] code changed

#### Firefox & Opera  

- [ ] Require moving google analytics.  Can be added differently in Firefox. Could always remain in Webstore.
 -  [x] currently no google analytics in Webstore too

### June 2024, Manifest3:

 - Only chrome is required yet.  
 -  <del> Firefox remains in Manifest2, because it requires a different signature for Manifest3

#### <del> Edge: doesnt allow a chrome update url 
  - <del> update URL  edge:  https://edge.microsoft.com/extensionwebstorebase/v1/crx ,  replace chrome: https://clients2.google.com/service/update2/crx  </del>
    - [x] update URL removed. (any downside?) 
  
