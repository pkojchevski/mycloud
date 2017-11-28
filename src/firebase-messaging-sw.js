// var CACHE_STATIC_NAME = 'static_v7';
// var CACHE_DYNAMIC_NAME = 'dynamic_v1';

// var STATIC_FILES =[
//     './',
//     './build/main.js',
//     './build/main.css',
//     './build/polyfills.js',
//     './build/vendor.js',
//     'index.html',
//     'manifest.json',
//     'http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css',
//     'http://localhost:8100/ionic-lab/static/js/lab.js',
//     'http://localhost:8100/ionic-lab/static/img/view-logo.jpg',
//     'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js',
//     './assets/img/mycloud.png'
// ];

// function isInArray(string, array) {
//   var cachePath;
//   if(string.indexOf(self.origin) === 0) {
//     cachePath = string.substring(self.origin.length);
//     console.log('cachePath first:'+cachePath);
//   } else {
//     cahcePath = string;
//     console.log('cachePath second:'+cachePath);
//   }
//   return array.indexOf(cachePath) > - 1;
// }

// self.addEventListener('install', event => {
//   console.log("[ServiceWorker] installed", event);
//   event.waitUntil(
//     caches.open(CACHE_STATIC_NAME).then((cache) => {
//       console.log("[ServiceWorker] caching files");
//       return cache.addAll(STATIC_FILES);
//     })
//   )
// })

// self.addEventListener('activate', event => {
//   console.log("[ServiceWorker] activated", event);
//   event.waitUntil(
//   caches.keys().then(keyList => {
//     console.log('keyList',JSON.stringify(keyList));
//     return Promise.all(keyList.map(key => {
//       if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
//        return caches.delete(key);
//       }
//     }));
//   })
// )
// })

// self.addEventListener('fetch', event => {
//   if(event.request.url !== 'http://localhost:8100/ionic-lab') {
//     event.respondWith(
//       caches.match(event.request).then(response => {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request).then(res => {
//              caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//                cache.put(event.request.url, res.clone());
//                return res;
//              })
//         }).catch(err => {

//         })
//       }
//     })
//     )
//   }
// })


 importScripts('./build/sw-toolbox.js');

importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '566986544653'
});
const messaging = firebase.messaging();

self.toolbox.options.cache = {
  name: 'ionic-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    './build/main.js',
    './build/main.css',
    './build/polyfills.js',
    './build/vendor.js',
    'index.html',
    'manifest.json'
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.cacheFirst);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;


 