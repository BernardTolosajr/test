const express = require('express');
const axios = require('axios').default;
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const rs = require('jsrsasign'); //sample rsa-js library, you can use other or if you have your own rsa library
const moment = require('moment'); //moment library

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

const date = new Date();
const currentTimestamp = moment(date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')   

// Auth API
app.get('/auth/:authId', async (req, res) => {

  const getSignature = (method, uri, clientId, httpBody) => {
    const HTTP_METHOD = method;
    const HTTP_URI = uri;
    const CLIENT_ID = clientId;
    const REQUEST_TIME = currentTimestamp;
    const HTTP_BODY = httpBody
  
    const CONTENT_TO_BE_SIGNED = `${HTTP_METHOD} ${HTTP_URI}\n${CLIENT_ID}.${REQUEST_TIME}.${JSON.stringify(HTTP_BODY)}`;
    // console.log(CONTENT_TO_BE_SIGNED);
  
        // set RSA privateKey
    const rsaPrivateKey = rs.KEYUTIL.getKey(privateKey, 'passwd');
  
    // initialize
    const sig = new rs.KJUR.crypto.Signature({alg: 'SHA256withRSA'});
    
    // initialize for signature generation
    sig.init(rsaPrivateKey);
    sig.updateString(CONTENT_TO_BE_SIGNED);
    
    // calculate signature
    const sigValueHex = sig.sign();
    // console.log('sigValueHex: ' + sigValueHex)
  
    const hex2b64Signature = rs.hex2b64(sigValueHex)
    // console.log('hex2b64Signature: ' + hex2b64Signature)
    
    const encodedSignature = encodeURIComponent(hex2b64Signature)
    // console.log('encodedSignature: ' + encodedSignature)

    return "algorithm=RSA256, keyVersion=2, signature=" + encodedSignature;
  }

  // POST
  // /v1/authorizations/applyToken.htm
  // 2022030313304100083286
 
  const body = 
   {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
    extendInfo: {customerBelongsTo:"GCASH"}
  };

  const headers = {
    "content-type": "application/json; charset=UTF-8",
    "Client-Id": '2022030313304100083286',
    "Request-Time": currentTimestamp,
    "Signature": getSignature('POST','/v1/authorizations/applyToken.htm', '2022030313304100083286', body ),
  }


    axios
      .post('https://api-sit.saas.mynt.xyz/v1/authorizations/applyToken.htm', body, { headers }) // v1
      .then((response) => {
        const BODY2 = {
          accessToken: response.data.accessToken || "202203228xtJgyd7HXsrftcTE7SqLHRks12vtMd8MX07YHaV2xu0886400079501", 
          // extendInfo: {customerBelongsTo:"GCASH"}
        }

        const headers2 = {
          "content-type": "application/json; charset=UTF-8",
          "Client-Id": '2022030313304100083286',
          "Request-Time": currentTimestamp,
          "Signature": getSignature('POST','/v1/customers/user/inquiryUserInfoByAccessToken.htm', '2022030313304100083286', BODY2),
        }

        console.log("BODY2:", BODY2)
        let test = null;
        axios
        .post('https://api-sit.saas.mynt.xyz/v1/customers/user/inquiryUserInfoByAccessToken.htm', BODY2, {headers: headers2} ) // v1
        .then((zxc) => {
          console.log(zxc.data)
          test = zxc.data;

          return res.status(200).json({
            status: 'success',
            response: response.data,
            authCode: req.params.authId,
            headers,
            userInquiry: test
          });
        })


    
      })
      .catch((error) => {
        console.log('error', error.data);
        return res.status(500).json({
          status: 'fail',
          error: `GCASH SERVER ERROR: ${error.message}`,
          errors: error,
          // CONTENT_TO_BE_SIGNED,
          // authCode: req.params.authId,
          // headers: {
          //   ...headers,
          // },
          // HTTP_BODY,
        });
      });
  // });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening to port 3000');
});

