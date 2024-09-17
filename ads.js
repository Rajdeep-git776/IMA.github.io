// Define constants for video dimensions
const VIDEO_WIDTH = 600;
const VIDEO_HEIGHT = 380;

// Get references to DOM elements
const videoElement = document.getElementById('video-element');
const adContainer = document.getElementById('ad-container');

let adsManager;
let adsLoader;
let adDisplayContainer;
let intervalTimer;

// Initialize and start the video ad
function startVideo(vastTagUrl) {
  requestAds(vastTagUrl);
}

// Create and initialize the ad display container
function createAdDisplayContainer() {
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
}

// Request ads from the IMA SDK
function requestAds(vastTagUrl) {
  createAdDisplayContainer();
  adDisplayContainer.initialize();
  videoElement.load();

  adsLoader = new google.ima.AdsLoader(adDisplayContainer);

  adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);

  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false
  );
  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false
  );

  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://your-vast-tag-url.com/vast.xml'; // Replace with your VAST tag URL
  adsRequest.linearAdSlotWidth = VIDEO_WIDTH;
  adsRequest.linearAdSlotHeight = VIDEO_HEIGHT;
  adsRequest.nonLinearAdSlotWidth = VIDEO_WIDTH;
  adsRequest.nonLinearAdSlotHeight = VIDEO_HEIGHT;

  adsLoader.requestAds(adsRequest);
}

// Handle when ads manager is loaded
function onAdsManagerLoaded(adsManagerLoadedEvent) {
  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement, adsRenderingSettings);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.CLICK, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.FIRST_QUARTILE, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.MIDPOINT, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.THIRD_QUARTILE, onAdEvent);

  try {
    adsManager.init(VIDEO_WIDTH, VIDEO_HEIGHT, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    videoElement.play();
  }
}

// Handle ad events
function onAdEvent(adEvent) {
  const ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.STARTED:
      document.getElementById('page-content').style.display = 'none';
      intervalTimer = setInterval(() => {
        const remainingTime = adsManager.getRemainingTime();
      }, 300);
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      document.getElementById('page-content').style.display = 'block';
      clearInterval(intervalTimer);
      break;
    case google.ima.AdEvent.Type.CLICK:
      const clickThroughUrl = ad.getClickThroughUrl();
      if (clickThroughUrl) {
        window.open(clickThroughUrl, '_blank');
      }
      break;
    case google.ima.AdEvent.Type.FIRST_QUARTILE:
    case google.ima.AdEvent.Type.MIDPOINT:
    case google.ima.AdEvent.Type.THIRD_QUARTILE:
      console.log(`Ad event: ${adEvent.type}`);
      break;
  }
}

// Handle ad errors
function onAdError(adErrorEvent) {
  adsManager.destroy();
}

// Handle content pause
function onContentPauseRequested() {
  videoElement.pause();
}

// Handle content resume
function onContentResumeRequested() {
  videoElement.play();
}

// Start the ad automatically when the page loads
window.onload = function() {
  const vastTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
    'iu=/23081990290/com.SampleInc.sample_VAST_Test&description_url=[placeholder]&tfcd=0&npa=0&sz=1x1%7C300x250%7C320x180%7C336x280%7C360x640%7C400x300%7C640x360%7C640x480&max_ad_duration=120000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator='; // Replace with your VAST tag URL
  startVideo(vastTagUrl);
};
