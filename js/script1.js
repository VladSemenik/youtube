/* eslint-disable guard-for-in */
/* eslint-disable func-names */
window.onload = function () {
  const URLS = 'https://www.googleapis.com/youtube/v3/search';
  const URLV = 'https://www.googleapis.com/youtube/v3/videos';
  const ITEM = '<header class="image-link"><img width="240px" height="180px" id="image-video" class="image-video" src="#" alt="" /><a id="link-video" class="links" href=""></a></header>';
  const INFO = '<div id="channelTitle" class="channel-title"></div><div id="publishedAt" class="published-at"></div><div id="viewCount" class="watchs"></div><div id="description" class="description"></div>';
  const PRELOADER = '<div id="preloader" class="preloader"></div>';
  const ITEMS = document.querySelector('#items');
  const send = {
    part: 'snippet',
    q: '',
    maxResults: 10,
    key: 'AIzaSyCwfzqmtPjPR0MMPSTn78sWgnfM6_XPCfM',
    my: 1,
  };
  const watchs = {
    part: 'snippet,contentDetails,statistics',
    id: 'A2FsgKoGD04',
    key: 'AIzaSyCwfzqmtPjPR0MMPSTn78sWgnfM6_XPCfM',
    my: 1,
  };
  const searchLine = document.querySelector('#search');
  const button = document.querySelector('#button');
  // const items = document.querySelector('#items');
  function makeUrl(obj, url) {
    let link = url;
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    values.forEach((element, i) => {
      if (!i) link += `?${keys[i]}=${element}`;
      else link += `&${keys[i]}=${element}`;
    });
    return link;
  }
  function printWatchs(response, forwarding) {
    forwarding.querySelector('#viewCount').innerHTML = response.items[0].statistics.viewCount;
  }

  function printInfo(item, element) {
    const channelInfo = document.createElement('section');
    channelInfo.className = 'channel-info';
    channelInfo.innerHTML = INFO;
    item.appendChild(channelInfo);
    channelInfo.querySelector('#channelTitle').innerHTML = element.snippet.channelTitle;
    channelInfo.querySelector('#publishedAt').innerHTML = element.snippet.publishedAt.slice(0, 10);
    watchs.id = element.id.videoId;
    getAsyncRequest(watchs, URLV, printWatchs, channelInfo);
    channelInfo.querySelector('#description').innerHTML = element.snippet.title;
  }

  function print(response) {
    const items = document.querySelector('#items');
    let page = document.createElement('section');
    let count = 0;
    let pageCount = 1;
    items.innerHTML = '';
    Array.from(response.items).forEach((element, index) => {
      const item = document.createElement('article');
      item.className = 'item';
      item.innerHTML = ITEM;
      page.className = 'pages';
      page.id = `page${pageCount}`;
      if (screen.availWidth / (260 * (count + 1)) >= 1) {
        page.appendChild(item);
      } else {
        page = document.createElement('section');
        page.className = 'pages';
        page.id = `page${pageCount}`;
        page.appendChild(item);
        count = 0;
        pageCount += 1;
      }
      count += 1;
      items.appendChild(page);
      item.querySelector('#image-video').src = element.snippet.thumbnails.medium.url;
      item.querySelector('#link-video').href = `https://www.youtube.com/watch?v=${element.id.videoId}`;
      item.querySelector('#link-video').innerHTML = element.snippet.title;
      printInfo(item, element);
    });
    setPagesPosition();
  }

  function getAsyncRequest(obj, requestURL, callPrint, forwarding) {
    const req = new XMLHttpRequest();
    requestURL = makeUrl(obj, requestURL);

    req.open('GET', requestURL, true);

    req.addEventListener('load', () => {
      console.log('Done:', req.status);
      console.log(JSON.parse(req.responseText));
      callPrint(JSON.parse(req.responseText), forwarding);
    });

    req.addEventListener('error', () => {
      console.log('Error:', req.status);
    });

    req.send(null);
  }

  function setPagesPosition() {
    const pages = document.querySelectorAll('.pages');
    Array.from(pages).forEach((element, index) => {
      element.style.left = `${screen.availWidth * index}px`;
      let start = 0;
      let end = 0;
      element.addEventListener('touchstart', (event) => {
        start = event.changedTouches['0'].clientX;
      });
      element.addEventListener('touchend', (event) => {
        end = event.changedTouches['0'].clientX;
        makeSwipe(start, end, element, index, pages);
      });
    });
  }

  function swipeLeft() {
    Array.from(document.querySelectorAll('.pages')).forEach((element) => {
      element.style.left = `${parseInt(element.style.left, 10) - screen.availWidth}px`;
      console.log('left', element.style.left);
    });
  }

  function swipeRight() {
    Array.from(document.querySelectorAll('.pages')).forEach((element) => {
      element.style.left = `${parseInt(element.style.left, 10) + screen.availWidth}px`;
      console.log('right', element.style.left);
    });
  }

  function makeSwipe(start, end, elem, index, items) {
    if (end - start < -screen.availWidth * 0) {
      if (index !== items.length - 1) {
        swipeLeft();
      }
    }
    if (end - start > screen.availWidth * 0) {
      if (index !== 0) {
        swipeRight();
      }
    }
  }


  button.addEventListener('click', () => {
    send.q = searchLine.value;
    ITEMS.innerHTML = PRELOADER;
    getAsyncRequest(send, URLS, print);
  });
};
