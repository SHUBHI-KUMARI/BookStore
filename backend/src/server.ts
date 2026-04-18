import App from './app';

const PORT = process.env.PORT || 3000;

const application = new App(PORT);

application.listen();
