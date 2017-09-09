# #PanSitzt.de
This is the official repository for [pansitzt.de](http://pansitzt.de).

## Guide Lines for joining developers
If you want to support the development of this app, please do so. Fork this repository and start hacking on.
Please keep in mind that you need to follow the following Guide Lines:

1. Development Language is **English**
1. UI language is **German** (you can help translate it if you want)
1. The addition of new libraries is discouraged if the included ones can do the job.
1. Submit a pull request if you have completed a new feature. Describe it as good as you can.
Keep in mind that I will check the code and make adjustments if needed or reject it.
1. I'm trying to use [GitFlow](https://danielkummer.github.io/git-flow-cheatsheet/) here so please follow it.

## 1. How to setup your development environment
Tools you will need:
 * [Node.JS v8.2.1](https://nodejs.org/en/) or higher (tested)
 * Node.JS enabled IDE (recommended: [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/), [Webstorm](https://www.jetbrains.com/webstorm/download/), [Visual Studio Code](https://code.visualstudio.com/) or [Atom](https://atom.io/))
 * [MySQL Server](https://dev.mysql.com/downloads/mysql/)

Other things you will need:
 * Twitter API Keys (register at [apps.twitter.com](https://apps.twitter.com/))
 * ReCaptcha API Keys (register at [google.com/recaptcha](https://www.google.com/recaptcha/admin))

1. Create a copy of _[config/template.json](config/template.json)_ and name it `config/dev.json`.
1. Create a database on your MySQL Server and run the `db/setup.sql` script to setup the database.
1. Enter all necessary information into your `config/dev.json`.
1. Open a terminal and install all dependencies using `npm install --save`.
1. Set an environment variable called `NODE_ENV` to `dev`.
1. (Optional but recommended) Set an environment variable called `DEBUG` to `pansitzt:*,sequelize:*` to get real time log messages.
1. Run `npm start` to start the server. Open your web browser and navigate to `http://localhost:1337`.

## 2. Recommended Steps on IntelliJ IDEA / WebStorm
Create a Debug Configuration of the type `Node.JS`. You will want to set the following attributes:

Working Directory: _the path of your local Git repository_<br>
JavaScript File: `bin\www` or `bin/www` (depending on your OS)

## Credits
This application uses the following libraries:
 * [Express](http://expressjs.com/) as Web Server
 * [express-recaptcha](https://www.npmjs.com/package/express-recaptcha) for Captcha
 * [twitter](https://www.npmjs.com/package/twitter),
   [node-twitter-api](https://www.npmjs.com/package/node-twitter-api)
   and [get-twitter-bearer-token](https://www.npmjs.com/package/get-twitter-bearer-token) for Twitter API Communication
 * [Sequelize](http://docs.sequelizejs.com/) for Database Access and Interaction (ORM)
 * [i18n](https://github.com/mashpie/i18n-node) for Message Translation
 * [moment](https://momentjs.com/) for Date & Time Rendering
 * [marked](https://github.com/chjj/marked) for Markdown Rendering
 * [image-type](https://www.npmjs.com/package/image-type) for Image Checking

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for detail.
