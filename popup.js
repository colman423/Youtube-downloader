var videoUrl;
var videoTitle;
var downloadBtn = document.getElementById('download');
var hint = document.getElementById('hint');
const AVAIABLE = "Download is available.";
const DISABLED = "Not in Youtube site.";
const FETCHING = "Fetching...";
const DOWNLOADING = "Downloading...";

function checkUrlValid() {
    return new Promise( function(resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(data) {
            var url = data[0].url;
            if( !url ) {
                reject("Not in Youtube site.");
            }
            else {
                var queryStr = new URL(url).search;
                var queryObj = new URLSearchParams(queryStr);
                var videoId = queryObj.get("v");
                if( !videoId ) {
                    reject("Not in video page.");
                }
                else {
                    resolve(data[0]);
                }
            }
        });
    })
}

checkUrlValid().then( function(res) {
    hint.innerText = AVAIABLE;
    videoUrl = res.url;
    videoTitle = res.title;
    // var host = videoUrl.hostname;
    // if( host=="www.youtube.com" ) {
    downloadBtn.removeAttribute('disabled');
    downloadBtn.addEventListener('click', fetchVideo);
    // }
}).catch( function(err) {
    hint.innerText = err;
})


function fetchVideo() {
    downloadBtn.setAttribute('disabled', true);
    hint.innerText = FETCHING;
    fetch('https://formats.yout.com/formats?url='+videoUrl, {
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/json',
            'Origin': 'https://yout.com',
            'Referer': 'https://yout.com/video/twJfzsn5U0I/',
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbF9mb3JfYXBpX2FjY2VzcyI6ImpvaG5AbmFkZXIubXgifQ.YPt3Eb3xKekv2L3KObNqMF25vc2uVCC-aDPIN2vktmA',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
        }
    }).then(function(res) {
        hint.innerText = DOWNLOADING;
        return res.json();
    }).then(function(res) {
        var cache = res.cache;
        data = cache[cache.length-1];
        var downloadUrl = data.url;
        return downloadVideo(downloadUrl);
    }).then( function(downloadId) {
        hint.innerText = AVAIABLE;
        downloadBtn.removeAttribute('disabled');
    }).catch(function(err) {
        alert("something err!");
        console.log(JSON.stringify(err));
        console.log(err);
        hint.innerText = AVAIABLE;
        downloadBtn.removeAttribute('disabled');
    });
}

function downloadVideo(url) {
    return new Promise( function(resolve, reject) {
        try {
            chrome.downloads.download({
                url: url,
                filename: videoTitle.replace(/[\/\\'":*?<>|]/g,'_')+".mp4"
            }, resolve);
        } catch (error) {
            reject(error);
        } 
    });
}