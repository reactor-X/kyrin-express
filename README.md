# Kyrin-Express
An (purposefully) opinionated node framework powered by express 4.x and typescript. 

Kyrin enables:
  - Centralized YML based configuration for node applications.
  - Structured express set up.
  - Kyrin container, gives access to all application services.
  - Automatic initialization of express middleware.
  - Automatic loading of routes by simple declarations.
  - Typescript support in Node enabling easier maintenance, support for latest standards, code portability and type checks!

> The framework is still in development, and uses ejs templates for views (for now), you can freely suggest and contribute to the code, or you can send an [email] or tweet me [@ravisemwal_].


### What powers Kyrin

Kyrin-Express uses a number of open source projects to work properly:

* [TypeScript] - State of the art JavaScript
* [node.js] - Evented I/O for the backend
* [Express] - Fast node.js network app framework

### Installation

Kyrin-Express requires [Node.js](https://nodejs.org/) v6+ to run.

Install the dependencies, devDependencies, compile typescript and start the server.

```sh
$ cd kyrin-express
$ npm install -g typescript
$ npm install
$ npm run build
$ npm start
```


### Bundled Middlewares

Kyrin-Express bundles these open source middlwares with it along with their types(@types).

* helmet
* express-session
* body-parser
* mongoose
* js-yaml
* passport
* serve-favicon
* socket.io
* ejs

### Todos

 - Integrate mongoose in services.
 - More configuration options
 - Rethink Kyrin's internal code structuring.

License
----
This program is licensed under MIT license.


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [email]: <mailto:ravisemwal@outlook.com>
   [git-repo-url]: <https://github.com/nodejs/node>
   [TypeScript]: <https://www.typescriptlang.org/>
   [node.js]: <http://nodejs.org>

   [express]: <http://expressjs.com>

   [@ravisemwal_]: <https://twitter.com/ravisemwal_>
