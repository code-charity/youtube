#### EVERY EXTENSION: 
- Edge: doesnt allow a chrome update url 
  - update URL  edge:  https://edge.microsoft.com/extensionwebstorebase/v1/crx ,  chrome: https://clients2.google.com/service/update2/crx 

##### Extension name

  - Edge & Whale deny '  (Replace ' with *) 
  - Whale denies '&' (replace with '+')  
  - Opera denies Emoji (delete)

- Microsoft store has a bug/complification with languages https://github.com/code4charity/YouTube-Extension/discussions/966#discussioncomment-963315

##### FIREFOX: 

- Security: remove or comment-out:  "remote content" (googleapis.com/youtube) called as dynamic innerHtml
- Version 3.2: Firefox has commented-out  // video.parentNode.parentNode.pauseVideo();  (fixes autoplay-bug)

#### Firefox & Opera :   

- Require moving google analytics. We can removing it from the Repo & only add it when generating the google webstore version.

#### ImprovedTube:
- Repo will include m.youtube permissions (firefox addons are available on phones) <br>    _(besides Google Webstore version remains with www . youtube only (by mistake), until we announce change)_
  - & *.youtube.com  + global permission, to work for all \<videos\>. 
     


