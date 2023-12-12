const chromium = require('chrome-aws-lambda');

module.exports.handler = async (event) => {
  const WIDTH = 1000;
  const domain = "https://api.kmapshot.com";

  let token = typeof event.queryStringParameters.AUTH_TOKEN === "undefined" ? null : event.queryStringParameters.AUTH_TOKEN;

  if (token === null) {
    return {
      statusCode: 400
    }
  }

  let type = event.queryStringParameters.type;
  let companyType = event.queryStringParameters.companyType;
  let lng = event.queryStringParameters.lng;
  let lat = event.queryStringParameters.lat;
  let level = event.queryStringParameters.level;
  let layerMode = event.queryStringParameters.layerMode;

  const header = {
    'AUTH_TOKEN': token
  }

  await chromium.font('/opt/NotoSansKR-Regular.otf');

  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,

    defaultViewport: {
      width: WIDTH,
      height: WIDTH
    },

    headless: chromium.headless,
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders(header);

  await page.goto(domain + `/image/template/` + companyType + `?`
    + `layerMode=` + layerMode
    + `&lat=` + lat
    + `&level=` + level
    + `&lng=` + lng
    + `&type=` + type
    + `&companyType=` + companyType);

  await page.waitForSelector('#checker_true');

  let goal_width;

  if (companyType === 'kakao') {
    switch (level) {
      case '1':
        goal_width = 5000;
        break;
      case '2':
        goal_width = 4000;
        break;
      case '5':
        goal_width = 5000;
        break;
      case '10':
        goal_width = 5000;
        break;
      default:
        goal_width = 0;
        break;
    }
  } else { // 구글
    switch (level) {
      case '1':
        goal_width = 6000;
        break;
      case '2':
        goal_width = 5000;
        break;
      case '5':
        goal_width = 6000;
        break;
      case '10':
        goal_width = 6000;
        break;
      default:
        goal_width = 0;
        break;
    }
  }

  for (let y = 0; y < goal_width; y += WIDTH) {
    for (let x = 0; x < goal_width; x += WIDTH) {

      await page.evaluate((_x, _y) => {
        window.scroll(_x, _y);
      }, x, y);

      let imageBuffer = await page.screenshot({
        type: "jpeg"
      });

      let response = {
        "base64EncodedImage": imageBuffer.toString('base64'),
        "x": x,
        "y": y
      };


      // 여기서 클라한테 쏘는 코드 작성
      
      // axios.post(domain + "/image/storage", {
      //   "uuid": gen_uuid,
      //   "base64EncodedImage": imageBuffer.toString('base64'),
      // }, {
      //   headers: header
      // })
      //   .then(function (response) {
      //     count++;
      //   })
      //   .catch(function (error) {
      //     count++;
      //   });;

    }
  }

  await browser.close();


  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'api.kmapshot.com',
    }
  }
};