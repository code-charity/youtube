- Microsoft store has a bug/complification with languages https://github.com/code4charity/YouTube-Extension/discussions/966#discussioncomment-963315

### Our build script should consider these rules per browser&store:


##### FIREFOX: 

- [ ] Comment out PiP button in code and menu.  Or at least dont set it by defaults.
- Version 3.2: Firefox has commented-out  // video.parentNode.parentNode.pauseVideo();  (fixes autoplay-bug)
- Security: remove or comment-out:  "remote content" (googleapis.com/youtube) called as dynamic innerHtml
   - [x] code changed

##### Extension name (title in manifest.js)

  - [ ] Edge & Whale deny '  (Replace ' with *) 
  - [ ] Whale denies '&' (Replace with '+')  
  - <del> Opera removes Emoji automatically
  
#### Firefox & Opera  

- [ ] Require moving google analytics.  Can be added differently in Firefox. Could always remain in Webstore.

#### ImprovedTube:
- [ ] We should include m.youtube.
  AND  *.youtube.com  + global permission, to work for all \<video\>'s. 
  <br> besides right now only our Google Webstore version should remains with www.youtube, until we announce change

#### <del> Edge: doesnt allow a chrome update url 
  - <del> update URL  edge:  https://edge.microsoft.com/extensionwebstorebase/v1/crx ,  replace chrome: https://clients2.google.com/service/update2/crx  </del>
    - [x] update URL removed. (any downside?) 
  
     


