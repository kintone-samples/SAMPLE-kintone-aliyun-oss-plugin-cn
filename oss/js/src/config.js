jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';
  $(function() {
    const message = {
      'en': {
        'msg_secret_id': 'OSS Secret ID',
        'msg_secret_key': 'OSS Secret Key',
        'msg_bucket': 'PSS Bucket Name',
        'msg_bucket_description': 'Note: If you switch the bucket, ' +
        'the file list in the directory corresponding to the original record in the APP will not be displayed normally.',
        'msg_region': 'OSS Region',
        'msg_region_description': 'eg: oss-cn-shanghai',
        'msg_role': 'Role',
        'msg_directory': 'Directory',
        'msg_directory_description': 'Single-line text field.',
        'msg_upload': 'Upload area',
        'msg_upload_description': 'Space field (must be different from the file list area field)',
        'msg_fileList': 'File List area',
        'msg_fileList_description': 'Space field (must be different from the upload area field)',
        'msg_plugin_submit': '     Save   ',
        'msg_plugin_cancel': '     Cancel   ',
        'msg_required_field': 'Please enter the required field.',
        'msg_fields_are_same': 'The values of the "Upload area" and "File List area" fields must be different.'
      },
      'zh': {
        'msg_secret_id': 'OSS 身份识别ID',
        'msg_secret_key': 'OSS 身份密钥',
        'msg_bucket': 'OSS 存储桶名',
        'msg_bucket_description': '注意：如果切换存储桶，则与APP中原始记录相对应的目录中的文件列表将不会正常显示。',
        'msg_region': 'OSS 地域信息',
        'msg_region_description': '例: oss-cn-shanghai',
        'msg_role': 'Role',
        'msg_directory': '目录字段',
        'msg_directory_description': '单行文本字段',
        'msg_upload': '上传区域字段',
        'msg_upload_description': '空白栏字段（必须与文件列表区域字段不同）',
        'msg_fileList': '文件列表区域字段',
        'msg_fileList_description': '空白栏字段（必须与上传区域字段不同）',
        'msg_plugin_submit': '     保存   ',
        'msg_plugin_cancel': '     返回   ',
        'msg_required_field': '请输入必填字段。',
        'msg_fields_are_same': '“上传区域”和“文件列表区域”字段的值必须不同。'
      }
    };

    const lang = kintone.getLoginUser().language;
    const i18n = (lang in message) ? message[lang] : message['zh'];

    $('span[datatype="translate"]').each(function(i, elt) {
      $(elt).text(i18n[$(elt).attr('data-content')]);
    });

    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (config['secretId']) {
      $('#secretId').val(config['secretId']);
    }
    if (config['secretKey']) {
      $('#secretKey').val(config['secretKey']);
    }
    if (config['bucket']) {
      $('#bucket').val(config['bucket']);
    }
    if (config['region']) {
      $('#region').val(config['region']);
    }
    if (config['role']) {
      $('#role').val(config['role']);
    }

    KintoneConfigHelper.getFields('SINGLE_LINE_TEXT').then(function(resp) {
      for (let i = 0; i < resp.length; i++) {
        $('#directory').append($('<OPTION>').text(resp[i]['label']).val(resp[i]['code']));
      }
      if (config['directory']) {
        $('#directory').val(config['directory']);
      }
    }).catch(function(err) {
      console.log(err);
    });

    KintoneConfigHelper.getFields('SPACER').then(function(resp) {
      for (let i = 0; i < resp.length; i++) {
        $('#upload').append($('<OPTION>').text(resp[i]['elementId']).val(resp[i]['elementId']));
        $('#fileList').append($('<OPTION>').text(resp[i]['elementId']).val(resp[i]['elementId']));
      }
      if (config['upload']) {
        $('#upload').val(config['upload']);
      }
      if (config['fileList']) {
        $('#fileList').val(config['fileList']);
      }
    }).catch(function(err) {
      console.log(err);
    });

    $('#plugin_submit').click(function() {
      const secretId = $('#secretId').val().trim();
      const secretKey = $('#secretKey').val().trim();
      const bucket = $('#bucket').val().trim();
      const region = $('#region').val().trim();
      const role = $('#role').val().trim();
      const directory = $('#directory').val().trim();
      const upload = $('#upload').val().trim();
      const fileList = $('#fileList').val().trim();

      if (secretId === null || secretKey === null || bucket === null || region === null || role === null || directory === null ||
        upload === null || fileList === null) {
        alert(i18n.msg_required_field);
        return;
      }
      if (secretId.length === 0 || secretKey.length === 0 || bucket.length === 0 || region.length === 0 || role.length === 0 ||
        directory.length === 0 || upload.length === 0 || fileList.length === 0) {
        alert(i18n.msg_required_field);
        return;
      }
      if (upload === fileList) {
        alert(i18n.msg_fields_are_same);
        return;
      }
      const submitConfig = {};
      submitConfig['secretId'] = secretId;
      submitConfig['secretKey'] = secretKey;
      submitConfig['bucket'] = bucket;
      submitConfig['region'] = region;
      submitConfig['role'] = role;
      submitConfig['directory'] = directory;
      submitConfig['upload'] = upload;
      submitConfig['fileList'] = fileList;

      kintone.plugin.app.setConfig(submitConfig);
    });

    $('#plugin_cancel').click(function() {
      history.back();
    });

  });
})(jQuery, kintone.$PLUGIN_ID);