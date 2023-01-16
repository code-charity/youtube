### For every Browser extension, a builder / build.py should consider these rules per browser-store:
- Edge: doesnt allow a chrome update url 
  - update URL  edge:  https://edge.microsoft.com/extensionwebstorebase/v1/crx ,  replace chrome: https://clients2.google.com/service/update2/crx 

##### Extension name (title in manifest.js)

  - Edge & Whale deny '  (Replace ' with *) 
  - Whale denies '&' (replace with '+')  
  - Opera denies Emoji (delete)

- Microsoft store has a bug/complification with languages https://github.com/code4charity/YouTube-Extension/discussions/966#discussioncomment-963315

##### FIREFOX: 

- Security: remove or comment-out:  "remote content" (googleapis.com/youtube) called as dynamic innerHtml
- Version 3.2: Firefox has commented-out  // video.parentNode.parentNode.pauseVideo();  (fixes autoplay-bug)

#### Firefox & Opera :   

- Require moving google analytics.  However it can be added / remain when generating the google webstore version.

---
---

#### ImprovedTube only:
- The repo should include m.youtube (firefox addons are available on phones)  
  AND  *.youtube.com  + global permission, to work for all \<video\>'s. 
 <br>  besides as of now only our Google Webstore version should remains with www.youtube, until we announce change
  
     


