# Planning Poker

An app that will allow a software development team to play Planning Poker

## Resigned 

This app has had the UI updated and the back end re-factored. This app is based off of [Jenni's Planning Poker](https://github.com/jenjaina/planning-poker).  

## Description

Welcome! This app is designed to allow a software development team to play "Planning Poker", a game used to estimate how much time different development tasks will take. To learn more about Planning Poker, check out the article on wikipedia (http://en.wikipedia.org/wiki/Planning_poker). The app will run in your browser and allow your team to silently vote on tasks, then reveal the results.


## How to use the app

Clone the repository, open a command line/terminal, and cd into the directory.

`npm install`

Next, start the build by typing:

`gulp build` _run at least the first time to create all required files_


## How to run the app locally

`npm run dev` _will execute `gulp` and start a server at `localhost:1337`_

You can open multiple tabs to see how multiple users can submit their estimations and view the results.

## How to deploy the app

`npm start` will build the app and start `node server.js` for the host

Thanks for viewing!
