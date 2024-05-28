// // src/service-worker.ts
// import { precacheAndRoute } from 'workbox-precaching';
// import { registerRoute } from 'workbox-routing';
// import { NetworkFirst } from 'workbox-strategies';
// import ReactDOMServer from 'react-dom/server';
// import React from 'react';
// import { clientsClaim } from 'workbox-core'
// 'use server'

// console.log('Hello from service worker!')

// declare const self: ServiceWorkerGlobalScope;

// self.skipWaiting()
// clientsClaim()

// precacheAndRoute(self.__WB_MANIFEST);

// registerRoute(
//   ({ url }) => {
//     return url.pathname === '/api/data'
//   },
//   new NetworkFirst({
//     cacheName: undefined,
//     plugins: [
//       {
//         requestWillFetch: async ({ request }) => {
//           console.log({ request });
//           const response = await Promise.resolve(JSON.stringify({ 'title': 'Hello', 'description': 'World' }))
//           const jsonData = JSON.parse(response);

//           // Create a Server Component and render it


//           const renderedComponent = <ServerComponent jsonData={jsonData} />


//           // Modify the response to include the rendered component
//           return new Request(request.url, {
//             headers: request.headers,
//             body: ReactDOMServer.renderToString(renderedComponent),
//             status: 200,
//             statusText: 'OK',
//           });

//         },
//       },
//     ],
//   })
// );


// const ServerComponent: React.FC<{ jsonData: { title: string, description: string } }> = ({ jsonData }) => (
//   <div>
//     <h1>{jsonData.title}</h1>
//     <p>{jsonData.description}</p>
//   </div>
// )