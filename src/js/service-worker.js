(function(){

const version = "3.0.0-{%INSERT-DATE%}";
const expectedCaches = [`v${version}`];

const reqFiles = [
	`/`,
	`./index.html`,
	`./sprites.png`,
	`./stylesheet.min.css`,
	`./scripts.min.js`,
	`https://code.jquery.com/jquery-3.3.1.slim.min.js`,
	`https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js`,
	`https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js`,
];

let requestCount = 0;
const logColors = {
	"Serve":   "lightblue",
	"Cache":   "lightgreen",
	"NoCache": "red",
	"Delete":  "#ff6666"
};
const swLog = () => {
	const jobID = requestCount++;
	return function log (tag, ...args) {
		let css = `padding:2px 4px; width:32em; background:${logColors[tag] || "lightgrey"}`;
		console.log(`%c[ServiceWorker ${version}] Job ${jobID}`, css, ...args);
	};
};

self.addEventListener('install', e => {
	//
	// fires when the browser sees this version of the service worker for the first time
	//
	const log = swLog();
	log("Install", `Installing version ${version}`);

	e.waitUntil(
		caches.open(`v${version}`).then(cache => {
			return cache.addAll(reqFiles)
				.then(() => self.skipWaiting());
		})
	);
});

self.addEventListener('activate', e => {
	//
	// fires when the service worker goes live
	// (workers remain inactive until their previous version is stopped)
	//
	requestCount = 0;
	const log = swLog();
	log("Activate", `Activating version ${version}`);

	e.waitUntil(self.clients.claim());
	e.waitUntil(
		caches.keys().then( cacheNames => {
			return Promise.all( cacheNames.map( thisCacheName => {
				if (!expectedCaches.includes(thisCacheName)) {
					log("Delete", `Deleting cache ${thisCacheName}`);
					return caches.delete(thisCacheName);
				}
			}) );
		})
	);
});

self.addEventListener('fetch', e => {
	//
	// fires for every page request within the service worker's scope
	// also for requests made by those pages
	//
	let log;
	
	if (!e.request.url.endsWith('/') && !e.request.url.endsWith('.html'))
		log = swLog();
	else {
		requestCount = 0;
		log = swLog();
		log("Page", `Version ${version}, loading page`);
	}

	e.respondWith(
		// cache lookup
		caches.match(e.request).then( cachedResponse => {
			// found in cache?
			if (cachedResponse) {
				log("Serve", `Serving ${e.request.url} from cache`,  "| request method:", e.request.method, "| headers:", e.request.headers);
				return cachedResponse;
			}

			// fetch from the web
			let requestClone = e.request.clone();
			return fetch(requestClone).then( response => {
				
				// sanity check before caching
				if (!response || !e.request.url.startsWith(location.origin)) {
					if (!e.request.url.startsWith(location.origin))
						log("NoCache", `Not caching ${e.request.url} (external url).`);
					return response;
				}
				
				// cache
				let responseClone = response.clone();
				return caches.open(`v${version}`).then( cache => {
					log("Cache", `Caching ${e.request.url}`, "| request method:", e.request.method, "| headers:", e.request.headers);
					cache.put(e.request, responseClone);
					return response;
				});

			});
		})
	);
});

})();