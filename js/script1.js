/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable func-names */
window.onload = function () {
  const URLS = 'https://www.googleapis.com/youtube/v3/search';
  const URLV = 'https://www.googleapis.com/youtube/v3/videos';
  const ITEM = '<header class="image-link"><img width="240px" height="180px" id="image-video" class="image-video" src="#" alt="" /><a id="link-video" class="links" href=""></a></header>';
  const INFO = '<div id="channelTitle" class="channel-title"></div><div id="publishedAt" class="published-at"></div><div id="viewCount" class="watchs"></div><div id="description" class="description"></div>';
  const PRELOADER = '<div id="preloader" class="preloader"></div>';
  const ITEMS = document.querySelector('#items');
  let countReq = 0;
  const send = {
    part: 'snippet',
    q: '',
    maxResults: 15,
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
  function getAsyncRequest(obj, requestURL, callPrint, ...forwarding) {
    const req = new XMLHttpRequest();
    requestURL = makeUrl(obj, requestURL);

    req.open('GET', requestURL, true);

    req.addEventListener('load', () => {
      callPrint(JSON.parse(req.responseText), forwarding);
    });

    req.addEventListener('error', () => {
      console.log('Error:', req.status);
    });

    req.send(null);
  }
  function printWatchs(response, forwarding) {
    forwarding[0].querySelector('#viewCount').innerHTML = response.items[0].statistics.viewCount;
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

  function createElem(elem, id) {
    elem.className = `${id}s`;
    return elem;
  }

  function movePages(point, i, points) {
    const pages = document.querySelectorAll('.pages');
    Array.from(pages).forEach((element, index) => {
      points[index].innerHTML = '';
      if (i !== index) {
        element.style.display = 'none';
      } else {
        element.style.display = 'flex';
        element.style.left = '0px';
        point.innerHTML = i;
      }
    });
  }

  function swipeLeft() {
    Array.from(document.querySelectorAll('.pages')).forEach((element) => {
      element.style.left = `${parseInt(element.style.left, 10) - screen.availWidth}px`;
    });
  }

  function swipeRight() {
    Array.from(document.querySelectorAll('.pages')).forEach((element) => {
      element.style.left = `${parseInt(element.style.left, 10) + screen.availWidth}px`;
    });
  }

  function print(response, forwarding) {
    const items = document.querySelector('#items');
    const nav = document.querySelector('#navigate');
    let page = document.createElement('section');
    let point = document.createElement('div');
    let count = 0;
    if (!forwarding[0]) {
      items.innerHTML = '';
      nav.innerHTML = '';
    }
    Array.from(response.items).forEach((element) => {
      const item = document.createElement('article');
      item.className = 'item';
      item.innerHTML = ITEM;
      page = createElem(page, 'page');
      point = createElem(point, 'point');
      nav.appendChild(point);
      if (screen.availWidth / (260 * (count + 1)) >= 1) {
        page.appendChild(item);
      } else {
        page = document.createElement('section');
        point = document.createElement('div');
        count = 0;
        createElem(page, 'page').appendChild(item);
        nav.appendChild(createElem(point, 'point'));
      }
      count += 1;
      items.appendChild(page);
      item.querySelector('#image-video').src = element.snippet.thumbnails.medium.url;
      item.querySelector('#link-video').href = `https://www.youtube.com/watch?v=${element.id.videoId}`;
      item.querySelector('#link-video').innerHTML = element.snippet.title;
      printInfo(item, element);
    });

    if (screen.availWidth > '1000') {
      Array.from(document.querySelectorAll('.points')).forEach((elem, i, array) => {
        elem.addEventListener('click', () => {
          movePages(elem, i, array);
          if (i === array.length - 1) {
            if (send.maxResults !== 45) {
              send.maxResults += 15;
              getAsyncRequest(send, URLS, print, false, countReq);
              countReq += 1;
            }
          }
        });
      });
    } else {
      nav.style.display = 'none';
      setPagesPosition();
    }
  }
  function makeSwipe(start, end, elem, index, items) {
    items = document.querySelectorAll('.pages');
    if (end - start < -screen.availWidth * 0.3) {
      if (index === items.length - 1) {
        if (send.maxResults !== 45) {
          send.maxResults += 15;
          getAsyncRequest(send, URLS, print, false, countReq);
          countReq += 1;
        }
      } else {
        swipeLeft();
      }
    }
    if (end - start > screen.availWidth * 0.3) {
      if (index !== 0) {
        swipeRight();
      }
    }
  }
  function setPagesPosition() {
    const pages = document.querySelectorAll('.pages');
    Array.from(pages).forEach((element, index) => {
      let start = 0;
      let end = 0;
      if (index >= send.maxResults - 15 * countReq) {
        element.style.left = `${screen.availWidth * index}px`;
      }
      element.addEventListener('touchstart', (event) => {
        start = event.changedTouches['0'].clientX;
      });
      element.addEventListener('touchend', (event) => {
        end = event.changedTouches['0'].clientX;
        makeSwipe(start, end, element, index, pages);
      });
    });
  }

  button.addEventListener('click', () => {
    send.q = searchLine.value;
    ITEMS.innerHTML = PRELOADER;
    send.maxResults = 15;
    countReq += 1;
    getAsyncRequest(send, URLS, print, false, countReq);
  });
};
