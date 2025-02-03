const tencentcloud = require('tencentcloud-sdk-nodejs/tencentcloud/index.js');

const TmtClient = tencentcloud.tmt.v20180321.Client;

const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: "ap-singapore",
  profile: {
    httpProfile: {
      endpoint: "tmt.tencentcloudapi.com",
    },
  },
};

const client = new TmtClient(clientConfig);

async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    console.log("Translating:", {
      text,
      from: sourceLanguage,
      to: targetLanguage,
    });

    const params = {
      SourceText: text,
      Source: sourceLanguage,
      Target: targetLanguage,
      ProjectId: 0,
    };

    const response = await client.TextTranslate(params);
    console.log("Translation API response:", response);

    return response.TargetText;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

async function detectLanguage(text) {
  try {
    const params = {
      Text: text,
      ProjectId: 0,
    };

    const response = await client.LanguageDetect(params);
    console.log("Language detection response:", response);
    return response.Lang;
  } catch (error) {
    console.error("Language detection error:", error);
    throw error;
  }
}

module.exports = {
  translateText,
  detectLanguage,
};
