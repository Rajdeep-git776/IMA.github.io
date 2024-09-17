var videoElement;
var adsLoaded = false;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

// On window load, attach an event to the play button click
// that triggers playback on the video element
window.addEventListener('load', function(event) {
  videoElement = document.getElementById('video-element');
  var playButton = document.getElementById('play-button');
  playButton.addEventListener('click', function(event) {
    if (!adsLoaded) {
      initializeIMA(); // Initialize the ad system
      loadAds(event);  // Load and play ads
    }
 });
 
});

// Make the AdsManager responsive
window.addEventListener('resize', function(event) {
  console.log("window resized");
  if(adsManager) {
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});

window.addEventListener('resize', function(event) {
  console.log("window resized");
});

function initializeIMA() {
  console.log("initializing IMA");
  adContainer = document.getElementById('ad-container');
  adContainer.addEventListener('click', adContainerClick);
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false);
adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false);

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener('ended', function() {
    if (adsManager) {
      adsManager.contentComplete();
    }else if (adsManager) {
      adsManager.destroy();  // Safely destroy adsManager when video ends
    }
  });

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?'+'iu=/23081990290/com.SampleInc.sample_VAST_Test&description_url=[placeholder]&tfcd=0&npa=0&sz=1x1%7C300x250%7C320x180%7C336x280%7C360x640%7C400x300%7C640x360%7C640x480&max_ad_duration=120000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

function adContainerClick(event) {
  console.log("ad container clicked");
  if(videoElement.paused) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
}


function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoElement);
  adsManager.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError);
  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    onContentPauseRequested);
  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    onContentResumeRequested);
}

function onContentPauseRequested() {
  videoElement.pause();
}

function onContentResumeRequested() {
  videoElement.play();
}

function onAdError(adErrorEvent) {
  console.error("Ad Error: ", adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  videoElement.play();  // Fallback to playing video without ads
}


function loadAds(event) {
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;
  event.preventDefault();

  console.log("loading ads");

  videoElement.load();
  adDisplayContainer.initialize();  // Ensure this is called after a user interaction

  var width = videoElement.clientWidth;
  var height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    console.error("AdsManager could not be started: ", adError);
    videoElement.play();  // Play video without ads if there is an error
  }
}
