
{
  "passwordSecret": [
    {
      "type": "hmac-sha256",
      "version": 1
    }
  ], 
  "passwordStrength": "medium", 
  "tokenSecret": "0123456789", 
  "requestAuthSecret": "9876543210", 
  "tokenExpiresIn": 7200, 
  "tokenExpiresThreshold": 3600, 
  "maxTokenLength": 10, 
  "passwordErrorLimit": 6, 
  "passwordErrorRetryTime": 3600, 
  "autoSetInviteCode": false, 
  "forceInviteCode": false, 
  "idCardCertifyLimit": 1, 
  "realNameCertifyLimit": 5, 
  "sensitiveInfoEncryptSecret": "", 
  "frvNeedAlivePhoto": false, 
  "userRegisterDefaultRole": [], 
  "app": { 
    "tokenExpiresIn": 2592000,
    "tokenExpiresThreshold": 864000,
    "oauth": {
      
      "weixin": {
        "appid": "",
        "appsecret": ""
      },
      
      "qq": {
        "appid": "",
        "appsecret": ""
      },
      "apple": { 
        "bundleId": ""
      }
    }
  },
  "web": { 
    "tokenExpiresIn": 7200,
    "tokenExpiresThreshold": 3600,
    "oauth": {
      "weixin-h5": { 
        "appid": "",
        "appsecret": ""
      },
      "weixin-web": { 
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "mp-weixin": {
    "tokenExpiresIn": 259200,
    "tokenExpiresThreshold": 86400,
    "oauth": {
      
      "weixin": {
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "mp-qq": {
    "tokenExpiresIn": 259200,
    "tokenExpiresThreshold": 86400,
    "oauth": {
      
      "qq": {
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "mp-alipay": {
    "tokenExpiresIn": 259200,
    "tokenExpiresThreshold": 86400,
    "oauth": {
      
      "alipay": {
        "appid": "",
        "privateKey": "", 
        "keyType": "PKCS8" 
      }
    }
  },
  "service": {
    "sms": {
      "name": "", 
      "codeExpiresIn": 180, 
      "scene": {
        "bind-mobile-by-sms": { 
          "templateId": "", 
          "codeExpiresIn": 240 
        }
      }
    },
    "univerify": {
      "appid": "" 
    }
  }
}

