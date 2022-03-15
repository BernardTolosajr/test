const express = require('express');
const axios = require('axios').default;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Hello server is running').end();
});

app.get('/auth/:authId', (req, res) => {
  console.log('wtf');
  // let config = {
  //   headers: {
  //     'Client-Id': 2022030313304100083286,
  //     signature: `algorith=RSA256,keyVersion=1,signature=${signature}`,
  //     'Content-Type': application / json,
  //     'Request-Time': new Date().toISOString(),
  //   },
  // };

  let data = {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
    extendInfo: '{"pointwestmp-sit":"GCASH"}',
  };

  axios
    .post('pointwestmp-sit.com.ph/v1/customer/user/inquiryUserInfoByAccessToken', data)
    // .get('pointwestmp-sit.com.ph/v1/oauths/applyToken', data, config)
    .then(function (response) {
      // console.log(response.data);
      console.log(response);
      res.status(200).json({
        authCode: req.params.authId,
        response: response,
        stausCode: 200,
      });
    })
    .catch(function (error) {
      console.log(error);
      res.status(200).json({
        authCode: req.params.authId,
        response: error,
        stausCode: 204,
      });
      // console.log('error');
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening to port 3000');
});

//POST pointwestmp-sit.com.ph/v1/oauths/applyToken
