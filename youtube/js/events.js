/*-----------------------------------------------------------------------------
>>> EVENTS
-------------------------------------------------------------------------------
1.0 DOMContentLoaded
2.0 Load
3.0 YouTube page data updated
4.0 YouTube visibility refresh
5.0 SPF done
6.0 Keydown
7.0 Mousedown
-----------------------------------------------------------------------------*/

ImprovedTube.events = function() {

	/*-------------------------------------------------------------------------
	1.0 DOMContentLoaded
	-------------------------------------------------------------------------*/

    window.addEventListener('DOMContentLoaded', ImprovedTube.pageUpdate);


	/*-------------------------------------------------------------------------
	2.0 Load
	-------------------------------------------------------------------------*/

    document.documentElement.addEventListener('load', function() {
        if (
            window.yt &&
            window.yt.player &&
            window.yt.player.Application &&
            window.yt.player.Application.create
        ) {
            window.yt.player.Application.create = ImprovedTube.ytPlayerApplicationCreateMod(window.yt.player.Application.create);
        }
    }, true);


	/*-------------------------------------------------------------------------
	3.0 YouTube page data updated
	-------------------------------------------------------------------------*/

    window.addEventListener('yt-page-data-updated', ImprovedTube.pageUpdate);


	/*-------------------------------------------------------------------------
	4.0 YouTube visibility refresh
	-------------------------------------------------------------------------*/

    window.addEventListener('yt-visibility-refresh', ImprovedTube.pageUpdate);


	/*-------------------------------------------------------------------------
	5.0 SPF done
	-------------------------------------------------------------------------*/

    window.addEventListener('spfrequest', ImprovedTube.pageUpdate);
    window.addEventListener('spfdone', ImprovedTube.pageUpdate);


	/*-------------------------------------------------------------------------
	6.0 Keydown
	-------------------------------------------------------------------------*/

    window.addEventListener('keydown', function() {
        ImprovedTube.allow_autoplay = true;
    }, true);


	/*-------------------------------------------------------------------------
	7.0 Mousedown
	-------------------------------------------------------------------------*/

    window.addEventListener('mousedown', function() {
        ImprovedTube.allow_autoplay = true;
    }, true);
    
};