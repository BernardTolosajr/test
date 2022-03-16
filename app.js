const express = require('express');
const axios = require('axios').default;
const https = require('https');
const rsa = require('node-rsa');
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
  const HTTP_URI = '/v1/oauths/applyToken';
  const HTTP_METHOD = 'POST';
  const CLIENT_ID = '2022030313304100083286';
  const REQUEST_TIME = new Date().toISOString();
  const HTTP_BODY = {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
  };

  const CONTENT_TO_BE_SIGNED = `${HTTP_METHOD} ${HTTP_URI}\n${CLIENT_ID} ${REQUEST_TIME} ${JSON.stringify(HTTP_BODY)}`;
  console.log('CONTENT_TO_BE_SIGNED', CONTENT_TO_BE_SIGNED);

  jwt.sign(CONTENT_TO_BE_SIGNED, privateKey, { algorithm: 'RS256' }, function (err, token) {
    // For testing try public and private key

    if (err) {
      return res.status(500).json({
        status: 'fail',
        error: err.message,
      });
    }
    const signatureToBase64 = new Buffer(token).toString('base64');

    const headers = {
      'Content-Type': 'application/json',
      'Client-Id': '2022030313304100083286',
      'Request-Time': new Date().toISOString(),
      signature: `algorithm=RSA256,keyVersion=1,signature=${signatureToBase64}`,
    };

    let v1Data = {
      referenceClientId: '2022030313304100083286',
      grantType: 'AUTHORIZATION_CODE',
      authCode: req.params.authId,
    };

    let v2Data = {
      authClientId: '2022030313304100083286',
      grantType: 'AUTHORIZATION_CODE',
      customerBelongsTo: 'GCASH',
      authCode: req.params.authId,
    };

    axios
      .post('https://pointwestmp-sit.com.ph/v1/oauths/applyToken', v1Data, { headers }) // v1
      // .post('https://pointwestmp-sit.com.ph/v2/oauths/applyToken', v2Data, { headers }) //v2
      .then((response) => {
        console.log('response gcash server');
        console.log('response', response);

        return res.status(200).json({
          status: 'success',
          CONTENT_TO_BE_SIGNED,
          signatureToBase64,
          signature: token,
          data: v1Data, // v1Data or v2Data
        });
      })
      .catch((error) => {
        console.log('error gcash server');
        console.log('error', error.message);

        return res.status(200).json({
          status: 'fail',
          error: error.message,
          CONTENT_TO_BE_SIGNED,
          signatureToBase64,
          signature: token,
          data: v1Data, // v1Data or v2Data
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
