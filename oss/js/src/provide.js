import STS from './sts';

export default class Provide {

  async init(PLUGIN_ID) {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    this.sts = new STS({
      accessKeyId: config.secretId,
      accessKeySecret: config.secretKey
    });
    const res = await this.sts.assumeRole(config.role);
    this.oss = new OSS({
      region: config.region,
      bucket: config.bucket,
      accessKeyId: res.Credentials.AccessKeyId,
      accessKeySecret: res.Credentials.AccessKeySecret,
      stsToken: res.Credentials.SecurityToken,
      refreshSTSToken: async () => {
        const {Credentials} = await this.sts.assumeRole(config.role);
        return {
          accessKeyId: Credentials.AccessKeyId,
          accessKeySecret: Credentials.AccessKeySecret,
          stsToken: Credentials.SecurityToken,
        };
      },
      refreshSTSTokenInterval: 3600,
    });
  }

  static async getInstance(PLUGIN_ID) {
    if (!this.instance) {
      this.instance = new Provide();
      await this.instance.init(PLUGIN_ID);
    }
    return this.instance;
  }
}