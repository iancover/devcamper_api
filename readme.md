# Dev Camper API

[Node/](https://nodejs.org)[Express](https://expressjs.com) _REST API_ for a web development bootcamp directory. Uses multiple [npm](https://npmjs.com) packages to add extra layers of security and protection for apps.

Serves the _API_ documentation using [Postman](https://www.postman.com/) on [PORT: 5000](http://localhost:5000)

---

## Auth Dependencies

- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) generated JSON web token encryption
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) to generate a `salt` and `hash` password encryptions
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) cookie header parsing middleware
- [cors](https://www.npmjs.com/package/cors) for Cross Origin Resourse Sharing enabling

## Security Dependencies

- [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) to prevent [MongoDB](https://mongodb.com) operator injections
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) to limit repeated requests for public APIs
- [helmet](https://www.npmjs.com/package/helmet) adds additional security _HTTP_ headers
- [hpp](https://www.npmjs.com/package/hpp) protection against _HTTP_ parameter polution
- [xss-clean](https://www.npmjs.com/package/xss-clean) to sanitize user input from _POST_, _GET_, and _URL_ params
- [dotenv](https://www.npmjs.com/package/dotenv) to load private stored `.env` variables

## Other Dependencies

- [colors](https://www.npmjs.com/package/colors) for styling _console.log()_ output with colors
- [morgan](https://www.npmjs.com/package/morgan) request logging middleware
- [nodemailer](https://www.npmjs.com/package/nodemailer) self-hosted email gateway to make requests to IMAP & SMTP
- [node-geocoder](https://www.npmjs.com/package/node-geocoder) _Node_ library for geocoding and reverse geocoding
- [slugify](https://www.npmjs.com/package/slugify) to remove and replace special characters on query strings

---

## Install Dependencies

```sh
npm install
```

## Run Scripts

To run the app in development

```sh
npm run dev
```

To run in production

```sh
npm start
```

---

## Setup

Rename `config/config.env.env` to `config/config.env` and add your values.

To _seed_ and _destroy_ the database with the _JSON_ in the `/_data` folder running the `seeder.js` file

```sh
npm run seed

npm run destroy
```

---

### Original Source

This project was built following the [Udemy]() course [Node.js API Masterclass With Express & MongoDB](https://www.udemy.com/share/1025ES3@3HgPf9UbkA8LfPXGiERiRGQVn3CUvoaZr2IlnnetuvWBoit9mhlzcT5YOzDUnjAS/) by [Brad Traversy](https://www.udemy.com/user/brad-traversy/) and you can view the original project's repo here [bradtraversy/devcamper-api](https://github.com/bradtraversy/devcamper-api)
