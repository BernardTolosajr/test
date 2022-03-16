const express = require('express');
const axios = require('axios').default;
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Read the key files
const publicKey = fs.readFileSync('./keys/client_public_key_php_dotnet.pem', 'utf-8'); //Try public or private
const privateKey = fs.readFileSync('./keys/client_private_key_php_dotnet.pem', 'utf-8'); //Try public or private

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const agent = new https.Agent({
  rejectUnauthorized: false,
});

app.get('/', (req, res) => {
  res.status(200).send('Hello server is running').end();
});

// Auth API
app.get('/auth/:authId', async (req, res) => {
  //Create signature here
  const HTTP_METHOD = 'POST';
  // const HTTP_URI = '/v1/oauths/applyToken';
  const HTTP_URI = 'https://pointwestmp-sit.com.ph/api/v1/oauths/applyToken';
  const CLIENT_ID = '2022030313304100083286';
  const REQUEST_TIME = new Date().toISOString();
  const HTTP_BODY = {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
  };

  const CONTENT_TO_BE_SIGNED = `${HTTP_METHOD} ${HTTP_URI}\n${CLIENT_ID}.${REQUEST_TIME}.${JSON.stringify(HTTP_BODY)}`;

  jwt.sign(CONTENT_TO_BE_SIGNED, privateKey, { algorithm: 'RS256' }, function (err, token) {
    // For testing try public and private key
    if (err) {
      return res.status(500).json({
        status: 'fail',
        error: err.message,
      });
    }
    // const signatureToBase64 = new Buffer(token).toString('base64');
    const signatureToBase64 = Buffer.from(token).toString('base64');

    const headers = {
      'Content-Type': 'application/json;charset=UTF-8;',
      'Client-Id': '2022030313304100083286',
      'Request-Time': new Date().toISOString(),
      signature: `algorithm=RSA256,keyVersion=1,signature=${signatureToBase64}`,
    };

    let data = {
      referenceClientId: '2022030313304100083286',
      grantType: 'AUTHORIZATION_CODE',
      authCode: req.params.authId,
      extendInfo: JSON.stringify({ customerBelongsTo: 'GCASH' }),
    };

    axios
      .post('https://pointwestmp-sit.com.ph/api/v1/oauths/applyToken', data, { headers }) // v1
      .then((response) => {
        console.log('response', response);

        return res.status(200).json({
          status: 'success',

          response,
          CONTENT_TO_BE_SIGNED,
          headers: {
            ...headers,
          },
          HTTP_BODY: data,
        });
      })
      .catch((error) => {
        console.log('error', error.message);

        return res.status(200).json({
          status: 'fail',
          error: `GCASH SERVER ERROR: ${error.message}`,
          CONTENT_TO_BE_SIGNED,
          headers: {
            ...headers,
          },
          HTTP_BODY: data,
        });
      });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening to port 3000');
});

// const signature = sha256.hmac(publicKey, CONTENT_TO_BE_SIGNED); // try public or pirvate
// const signatureToBase64 = Buffer.from(signature).toString('base64');
