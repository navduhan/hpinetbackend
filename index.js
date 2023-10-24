const express = require ('express')
const cors = require ('cors')
const connectDB = require('./src/db')

const app = express()
const apiPort = 3815
const routes =require('./src/routes/hpinet-route')

const accessControl = (req,  res, next) => {
  const allowedOrigins = [
    'http://127.0.0.1:4000', 'http://localhost:4000', 'http://127.0.0.1:4200', 'http://bioinfo.usu.edu','https://kaabil.net', 'https://localhost:3810'
  ];
  const origin = req.headers.origin;
  /*
  if (origin && typeof origin === 'string' && allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  */
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3810');
  res.header('Access-Control-Allow-Origin', 'https://bioinfo.usu.edu');
  res.header('Access-Control-Allow-Origin', 'https://kaabil.net');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, KBL-User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  return next();
}

// Allows other domains to use this domain as an API
const originsWhitelist = [
  'http://127.0.0.1:4000', 'http://localhost:4000', 'http://127.0.0.1:4200', 'http://localhost:4200', 'https://bioinfo.usu.edu', 'https://kaabil.net', 'http://localhost:3810'
];
const corsOptions = {
  origin: (origin, callback) => {
    if (origin && originsWhitelist.indexOf(origin) >= -1) {
      return callback(null, true);
    }

    const error = new Error('CORS Error');

    return callback(error, false);
  }
}

const cOpt = {
  origin: 'https://kaabil.net',
  credentials: true
}
app.use(express.urlencoded({extended:true}))
// app.use(cors("*"))
app.use(express.json())
app.use(accessControl);

connectDB.on('error', console.error.bind(console, 'MongoDB connection error:'))


app.use("/api", routes)

app.listen(apiPort, ()=> console.log(`Server runnning on port ${apiPort}`))
