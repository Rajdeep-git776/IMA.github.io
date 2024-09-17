var videoElement;
var adsLoaded = false;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

window.addEventListener('load', function(event) {
  videoElement = document.getElementById('video-element');
  var playButton = document.getElementById('play-button');

  playButton.addEventListener('click', function(event) {
    event.preventDefault();

      // test comment

    if (!adsLoaded) {
      // Initialize the IMA SDK and load ads
      initializeIMA();
      videoElement.pause();  // Pause content for ad loading
      loadAds(event);
    } else {
      videoElement.play();
    }
  });
});

function resizeAdToWebView(widthWV, heightWV) {

  // var width = window.innerWidth;
  // var height = window.innerHeight;

    var width = widthWV;
    var height = heightWV;

  if (adsManager) {
    // Resize the AdsManager to match the web view dimensions
    var widthMargin = width/10;
    var heightMargin = height/10;

    var vidPlayerWidth = width - widthMargin;
    var vidPlayerHeight = height - heightMargin;

    adsManager.resize(vidPlayerWidth, vidPlayerHeight, google.ima.ViewMode.NORMAL);

    const videoPlayer = document.getElementById('videoPlayer');

    // Apply the new dimensions to the video element
    videoPlayer.style.width = vidPlayerWidth + 'px';
    videoPlayer.style.height = vidPlayerHeight + 'px';
  }
}

window.addEventListener('resize', function(event) {
  // if (adsManager) {
  //   var width = videoElement.clientWidth;
  //   var height = videoElement.clientHeight;
  //   adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  resizeAdToWebView();
  
});

function initializeIMA() {
  console.log("Initializing IMA");

  adContainer = document.getElementById('ad-container');
  adContainer.addEventListener('click', adContainerClick);

  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);

  // Listen for ads loading or errors
  adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
  adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

  // Notify AdsLoader when content is complete
  videoElement.addEventListener('ended', function() {
    if (adsManager) {
      adsManager.contentComplete();
    }
    if (adsManager) {
      adsManager.destroy();
    }
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
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?'+'iu=/23081990290/com.SampleInc.sample_VAST_Test&description_url=[placeholder]&tfcd=0&npa=0&sz=1x1%7C300x250%7C320x180%7C336x280%7C360x640%7C400x300%7C640x360%7C640x480&max_ad_duration=120000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=';

  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  adDisplayContainer.initialize();  // Ensure it's called after user interaction
  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  console.log("AdsManager loaded");

  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);

  // Attach event listeners to AdsManager
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED,onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED,onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE,onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.FIRST_QUARTILE,onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.MIDPOINT,onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.THIRD_QUARTILE,onAdEvent);
  

  // Changed from clientWidth and ClientHeight to innerHeight and innerWidth
  var width = videoElement.innerWidth;
  var height = videoElement.innerHeight;

  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();  // Start the ad playback after it's loaded
  } catch (adError) {
    console.log('AdsManager could not be started: ', adError);
    videoElement.play();
  }
}

function onAdError(adErrorEvent) {
  console.error("Ad Error: ", adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  videoElement.play(); // Fallback to playing video without ads
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

function adContainerClick(event) {
  console.log("Ad container clicked");
  if (videoElement.paused) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
}
