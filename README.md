# Aliyun OSS for Kintone

基于[Tencent Cos for Kintone](https://gitee.com/cybozudeveloper/kintone-tencent-cos-plugin)修改。

在Kintone App中添加插件后，用户可以在App里对阿里云的对象存储（OSS）进行文件上传或下载。

# 编译

下载：

```bash
git clone https://github.com/kintone-samples/kintone-aliyun-oss-plugin-cn.git
```

进入项目目录，在终端中运行

```bash
npm i
```

等待依赖安装完成。

运行

```bash
npm run build
npm run build_plugin
```

# 插件

生成的插件

build/oss.zip

# 安装

将插件安装到Kintone, 请参考帮助文档[在kintone中安装插件](https://help.cybozu.cn/k/zh/admin/system_customization/add_plugin/plugin.html)

# 添加

将插件添加到Kintone App, 请参考帮助文档[在应用中添加插件](https://help.cybozu.cn/k/zh/user/app_settings/plugin.html)

# 使用文档

[无须服务端，利用kintone获取阿里云的STS临时访问凭证进而访问OSS](https://cybozudev.kf5.com/hc/kb/article/1599917/)

# License

MIT License

# Copyright

Copyright(c) Cybozu, Inc.