import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.PORT || 3002);
const host = process.env.HOST || '127.0.0.1';

const {createApp} = await import('./app.js');
const app = createApp();

app.listen(port, host, () => {
  console.log(`Servidor HelpDesk TI iniciado em ${host}:${port}.`);
});
