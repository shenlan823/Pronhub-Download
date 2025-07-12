function sendMessageToContentScript(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response);
    });
  });
}

sendMessageToContentScript(
  { cmd: "test", value: "test" },
  function (videoType) {
    if (!videoType) return;

    const boxEl = document.getElementsByTagName("ul")[0];
    let videoStr = "";

    videoType.forEach((item) => {
      videoStr += `<li>
        <label>清晰度：<span>${item.key}</span></label>
        <button class="button down">下载</button>
        <button class="button copy">复制</button>
      </li>`;
    });

    boxEl.innerHTML = videoStr;

    const dialog = document.getElementById("showDialog");
    const dialog1 = document.getElementById("showDialog1");

    document.querySelectorAll(".down").forEach((item, index) => {
      item.onclick = () => {
        const reg = /[\~\.\:\/\*\?\"\|\\\<\>]/g;
        chrome.downloads.download({
          url: videoType[index].val,
          filename: videoType[index].video_title.replace(reg, "") + ".mp4",
        });

        dialog1.showModal();
        setTimeout(() => dialog1.close(), 2000);
      };
    });

    document.querySelectorAll(".copy").forEach((item, index) => {
      item.onclick = () => {
        const url = videoType[index].val;
        const oInput = document.createElement("input");
        oInput.value = url;
        document.body.appendChild(oInput);
        oInput.select();
        document.execCommand("Copy");
        oInput.remove();
        dialog.showModal();
        setTimeout(() => dialog.close(), 1500);
      };
    });
  }
);
