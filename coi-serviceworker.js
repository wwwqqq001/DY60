/*! coi-serviceworker v0.1.7 - (c) 2021 Guido Zuidhof - MIT License */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener("message", (ev) => {
    if (!ev.data) return;
    if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => self.clients.matchAll().then(clients => clients.forEach(client => client.navigate(client.url))));
    }
  });
  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;
    const request = (coepCredentialless && r.mode === "no-cors" && r.destination === "image") ? new Request(r.url, { ...r, mode: "cors", credentials: "omit" }) : r;
    event.respondWith(fetch(request).then((response) => {
      if (response.status === 0) return response;
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
      if (!newHeaders.get("Cross-Origin-Opener-Policy")) newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
    }).catch((e) => console.error(e)));
  });
} else {
  (() => {
    const reloaded = window.sessionStorage.getItem("coiReloaded");
    if (reloaded) {
        window.sessionStorage.removeItem("coiReloaded");
    } else {
        const registration = navigator.serviceWorker && navigator.serviceWorker.register(window.document.currentScript.src).then((registration) => {
            registration.addEventListener("updatefound", () => { window.location.reload() });
            if (registration.active && !navigator.serviceWorker.controller) window.location.reload();
        }, (err) => console.error("COI Service Worker failed to register", err));
        if (registration) {
            window.sessionStorage.setItem("coiReloaded", "true");
            window.location.reload();
        }
    }
  })();
}