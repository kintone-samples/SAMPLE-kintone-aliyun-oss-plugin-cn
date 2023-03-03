/* eslint-disable new-cap */
import Base64 from 'crypto-js/enc-base64';
import HmacSHA1 from 'crypto-js/hmac-sha1';

export default class STS {
  constructor(options) {
    const {accessKeyId, accessKeySecret, endpoint} = options;
    this.options = {
      accessKeyId,
      accessKeySecret,
      endpoint: endpoint || 'https://sts.aliyuncs.com',
      format: 'JSON',
      apiVersion: '2015-04-01',
      sigMethod: 'HMAC-SHA1',
      sigVersion: '1.0',
    };
  }

  static escape(str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  static getSignature(method, params, key) {
    const {escape} = STS;
    const canoQuery = Object.keys(params)
      .sort()
      .map((k) => `${escape(k)}=${escape(params[k])}`)
      .join('&');
    const stringToSign = `${method.toUpperCase()}&${escape('/')}&${escape(canoQuery)}`;
    return Base64.stringify(HmacSHA1(stringToSign, `${key}&`));
  }

  async assumeRole(role, policy, expiration) {
    const method = 'POST';
    const opts = this.options;
    const params = {
      Action: 'AssumeRole',
      RoleArn: role,
      RoleSessionName: 'app',
      DurationSeconds: expiration || 3600,
      Format: opts.format,
      Version: opts.apiVersion,
      AccessKeyId: opts.accessKeyId,
      SignatureMethod: opts.sigMethod,
      SignatureVersion: opts.sigVersion,
      SignatureNonce: Math.random(),
      Timestamp: new Date().toISOString(),
    };
    if (policy) {
      params.Policy = typeof policy === 'string' ? JSON.stringify(JSON.parse(policy)) : JSON.stringify(policy);
    }
    params.Signature = STS.getSignature(method, params, opts.accessKeySecret);
    const result = await kintone.proxy(
      opts.endpoint,
      method,
      {'Content-Type': 'application/x-www-form-urlencoded'},
      new URLSearchParams(params).toString(),
    );
    const body = JSON.parse(result[0]);
    const status = result[1];
    if (status !== 200) {
      const err = new Error();
      err.status = status;
      const {Code, Message, RequestId} = body || {};
      err.message = `${Code}: ${Message}`;
      err.requestId = RequestId;
      throw err;
    }
    return body;
  }
}
