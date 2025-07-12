function Func() {
  return new Promise((resolve, reject) => {
    var jsString = document.querySelector("#player >script:nth-child(2)");
    if (!jsString) {
      jsString = document.querySelector("#player >script:nth-child(1)");
    }
    if (jsString) {
      jsString = jsString.innerHTML;
      var flashvars = jsString.match("flashvars_[0-9]{1,}")[0];
      const regex = new RegExp(
        `var\\s+${flashvars}\\s*=\\s*({[\\s\\S]*?});\\s*\\n`
      );
      const match = jsString.match(regex);
      const objectString = match[1];
      const jsObject = JSON.parse(objectString);
      resolve(jsObject);
    }
    jsString = document.querySelector("#video-player-bg > script:nth-child(6)");
    if (jsString) {
      jsString = jsString.innerHTML;
      var videoType = [];
      var urlTitle = jsString.match(/setVideoTitle\('(.*?)'\);/)[1];
      var urlLow = jsString.match(/setVideoUrlLow\('(.*?)'\);/)[1];
      if (urlLow) {
        var obj = {
          key: "Low",
          val: urlLow,
          video_title: urlTitle,
        };
        videoType.push(obj);
      }
      var urlHigh = jsString.match(/setVideoUrlHigh\('(.*?)'\);/)[1];
      if (urlHigh) {
        var obj = {
          key: "High",
          val: urlHigh,
          video_title: urlTitle,
        };
        videoType.push(obj);
      }
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request.cmd == "test") sendResponse(videoType);
      });
    }
  });
}

function getMp4Url(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        mp4UrlJson = JSON.parse(xhr.responseText);
        console.log("mp4UrlJson", mp4UrlJson);
        resolve(mp4UrlJson);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.send();
  });
}

Func().then((res) => {
  var videoType = [];
  Object.keys(res["mediaDefinitions"]).forEach((item) => {
    var itemInfo = res["mediaDefinitions"][item];
    if (itemInfo["format"] == "mp4") {
      getMp4Url(itemInfo["videoUrl"]).then((mp4UrlJson) => {
        for (const mp4Url of mp4UrlJson) {
          var obj = {
            key: mp4Url["quality"],
            val: mp4Url["videoUrl"],
            video_title: res.video_title,
          };
          videoType.push(obj);
        }
      });
    }
  });
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.cmd == "test") sendResponse(videoType);
  });
});
