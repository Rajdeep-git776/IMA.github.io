var videoElement;
var adsLoaded = false;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

window.addEventListener('load', function(event) {
  videoElement = document.getElementById('video-element');
  initializeIMA();
  var playButton = document.getElementById('play-button');
  
  playButton.addEventListener('click', function(event) {
    event.preventDefault();
    
    if (!adsLoaded) {
      // Pause the video immediately and load ads
      videoElement.pause();
      loadAds(event);
    } else {
      // If ads are already loaded, just play the video
      videoElement.play();
    }
  });
});

window.addEventListener('resize', function(event) {
  if (adsManager) {
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});

function initializeIMA() {
  console.log("Initializing IMA");
  
  adContainer = document.getElementById('ad-container');
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);

  // This must be called before requesting ads
  adDisplayContainer.initialize();

  adsLoader = new google.ima.AdsLoader(adDisplayContainer);

  // Listen for when ads are loaded or if an error occurs
  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false);
  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false);

  // Notify AdsLoader when the video content is finished
  videoElement.addEventListener('ended', function() {
    adsLoader.contentComplete();
  });
}

function loadAds(event) {
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;
  event.preventDefault();

  console.log("Loading ads");

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?'+'iu=/22387492205,22433815918/com.fusion.block.puzzle.Immersive0.1725259638&description_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.fusion.block.puzzle&tfcd=0&npa=0&sz=1x1%7C150x150%7C250x250%7C250x300%7C256x144%7C300x250%7C300x300%7C300x600%7C320x180&max_ad_duration=120000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=';

  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Request ads
  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  console.log("AdsManager loaded");

  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);

  // Attach event listeners to the AdsManager
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);

  try {
    adsManager.init(videoElement.clientWidth, videoElement.clientHeight, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    console.log('AdsManager could not be started');
    videoElement.play();
  }
}

function onAdError(adErrorEvent) {
  console.log("Ad Error: " + adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  videoElement.play();
}

function onContentPauseRequested() {
  console.log('Content paused for ad playback');
  videoElement.pause();
}

function onContentResumeRequested() {
  console.log('Resuming content after ads');
  videoElement.play();
}

function onAdEvent(adEvent) {
  console.log('Ad event: ' + adEvent.type);
}
