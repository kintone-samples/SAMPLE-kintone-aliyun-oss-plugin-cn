import {default as swal} from 'sweetalert2';
import Provide from './provide';

jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  const message = {
    'en': {
      'msg_tableTitle_fileName': 'FileName',
      'msg_tableTitle_fileSize': 'Size',
      'msg_tableTitle_fileDate': 'Date',
      'msg_btn_download': 'Download',
      'msg_btn_delete': 'Delete',
      'msg_alert_delete_title': 'Do you want to delete this file?',
      'msg_alert_delete_text': 'You can not revert it!',
      'msg_alert_delete_confirm': 'Yes, delete it!',
      'msg_alert_delete_cancel': 'Cancel',
      'msg_uploading': 'File uploading!',
      'msg_upload_progress': 'Upload progress: ',
      'msg_upload_speed': '%; Speed: ',
      'msg_upload_speed_unit': 'MB/s;',
      'msg_download_error': 'Error downloading or file does not exist!'
    },
    'zh': {
      'msg_tableTitle_fileName': '文件名',
      'msg_tableTitle_fileSize': '文件大小',
      'msg_tableTitle_fileDate': '文件日期',
      'msg_btn_download': '下载',
      'msg_btn_delete': '删除',
      'msg_alert_delete_title': '您想删除这个文件吗？',
      'msg_alert_delete_text': '您将无法恢复这个文件!',
      'msg_alert_delete_confirm': '是，删除它!',
      'msg_alert_delete_cancel': '取消',
      'msg_uploading': '文件上传中!',
      'msg_upload_progress': '上传进度: ',
      'msg_upload_speed': '%; 速度: ',
      'msg_upload_speed_unit': 'MB/s;',
      'msg_download_error': '下载出错或文件不存在！',
    }
  };

  const lang = kintone.getLoginUser().language;
  const i18n = (lang in message) ? message[lang] : message['zh'];
  const attachment = new kintoneUIComponent.Attachment();

  let config;

  const validateConfig = () => {
    config = kintone.plugin.app.getConfig(PLUGIN_ID);
    return config !== null;
  };

  if (!validateConfig()) {
    return;
  }

  const getFileName = (key) => {
    const lastIndex = key.lastIndexOf('/');
    if (lastIndex !== key.length - 1) {
      return key.substr(lastIndex + 1);
    }
    return '';
  };

  const getFileSize = (size) => {
    if (size === null || size.length === 0 || size === '0') {
      return '0 Bytes';
    }

    const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    const srcsize = Number(size);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    let resultSize = srcsize / Math.pow(1024, index);
    if (index !== 0) {
      resultSize = resultSize.toFixed(2);
    }
    return resultSize + ' ' + unitArr[index];
  };

  const formatDate = (dateObject, normalFormat) => {
    let result = '';
    if (dateObject instanceof Date) {
      const Y = dateObject.getFullYear();
      const M = dateObject.getMonth() + 1 < 10 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
      const D = dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate();
      const h = dateObject.getHours() < 10 ? '0' + dateObject.getHours() : dateObject.getHours();
      const m = dateObject.getMinutes() < 10 ? '0' + dateObject.getMinutes() : dateObject.getMinutes();
      const s = dateObject.getSeconds() < 10 ? '0' + dateObject.getSeconds() : dateObject.getSeconds();
      if (normalFormat) {
        result = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
      } else {
        result = Y + M + D + h + m + s;
      }
    }

    return result;
  };

  const getNowTime = () => {
    const nowTime = new Date();
    return formatDate(nowTime, false);
  };

  const getFileDate = (date) => {
    const tmpDateTime = date.split('T')[0].replace(/-/g, '/') + ' ' + date.split('T')[1].split('.')[0];
    const dateWithTz = new Date(tmpDateTime.substring(0, tmpDateTime.length - 1));
    dateWithTz.setHours(dateWithTz.getHours() + 8);
    return formatDate(dateWithTz, true);
  };

  kintone.events.on(['app.record.index.edit.show', 'app.record.create.show'], function(event) {
    const record = event.record;
    record[config.directory]['disabled'] = true;

    return event;
  });

  kintone.events.on('app.record.detail.show', async function(event) {
    const record = event.record;
    const directory = record[config.directory]['value'];
    let prefix = '';
    if (typeof directory !== 'undefined' && directory.length > 0) {
      prefix = directory + '/';
    } else {
      return event;
    }

    const div = document.createElement('div');
    const space = kintone.app.record.getSpaceElement(config.fileList);
    let fileListHtml = '<table id="fileList"><tr><th>' + i18n.msg_tableTitle_fileName +
      '</th><th>' + i18n.msg_tableTitle_fileSize +
      '</th><th>' + i18n.msg_tableTitle_fileDate + '</th><th></th></tr>';
    try {
      const {oss} = await Provide.getInstance(PLUGIN_ID);
      const downloadFile = (name) => {
        const url = oss.signatureUrl(name);
        if (url) {
          window.open(url);
        } else {
          swal.fire({
            icon: 'error',
            title: i18n.msg_download_error,
          });
        }
      };

      const deleteFile = async (name) => {
        await oss.delete(name);
        window.location.reload();
      };

      const data = await oss.list({
        prefix,
      });
      const files = data.objects;
      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        if (file['name'].lastIndexOf('/') !== file['name'].length - 1) {
          fileListHtml += '<tr><td>' + getFileName(file['name']) +
            '</td><td>' + getFileSize(file['size']) +
            '</td><td>' + getFileDate(file['lastModified']) +
            '</td><td><button id="downloadFile_' + i + '" class="button">' + i18n.msg_btn_download + '</button>&nbsp;&nbsp;' +
            '<button id="deleteFile_' + i + '" class="button">' + i18n.msg_btn_delete + '</button>' +
            '</td></tr>';
        }
      }
      div.innerHTML = fileListHtml;
      space.appendChild(div);
      jQuery('[id^=downloadFile_]').click(function(e) {
        const id = e.target.id;
        const key = files[id.slice(id.lastIndexOf('_') + 1)]['name'];
        downloadFile(key);
      });
      jQuery('[id^=deleteFile_]').click(function(e) {
        const id = e.target.id;
        const key = files[id.slice(id.lastIndexOf('_') + 1)]['name'];
        swal.fire({
          title: i18n.msg_alert_delete_title,
          text: i18n.msg_alert_delete_text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: i18n.msg_alert_delete_confirm,
          cancelButtonText: i18n.msg_alert_delete_cancel
        }).then((result) => {
          if (result.value) {
            deleteFile(key);
          }
        });
      });
    } catch (error) {
      event.error = error.message;
    }

    return event;
  });

  kintone.events.on(['app.record.detail.delete.submit', 'app.record.index.delete.submit'], async function(event) {
    const record = event.record;
    const directory = record[config.directory]['value'];
    let prefix = '';
    if (typeof directory !== 'undefined' && directory.length > 0) {
      prefix = directory + '/';
    } else {
      return event;
    }
    try {
      const {oss} = await Provide.getInstance(PLUGIN_ID);
      const list = await oss.list({
        prefix,
      });
      if (list.objects && list.objects.length > 0) {
        await oss.deleteMulti(list.objects.map((v) => v.name));
      }
    } catch (error) {
      event.error = error.message;
    }

    return event;
  });

  kintone.events.on('app.record.create.submit', function(event) {
    const record = event.record;
    const appId = kintone.app.getId();
    const loginUser = kintone.getLoginUser();
    record[config.directory]['value'] = appId + '/' + loginUser.name + '/' + getNowTime();

    return event;
  });

  kintone.events.on('app.record.edit.show', async function(event) {
    const record = event.record;
    const directory = record[config.directory]['value'];
    record[config.directory]['disabled'] = true;
    let prefix = '';
    if (typeof directory !== 'undefined' && directory.length > 0) {
      prefix = directory + '/';
    } else {
      return event;
    }

    const uploadSpace = kintone.app.record.getSpaceElement(config.upload);
    const uploadDiv = document.createElement('div');
    uploadDiv.appendChild(attachment.render());
    uploadSpace.appendChild(uploadDiv);
    attachment.setFiles([]);

    const fileListSpace = kintone.app.record.getSpaceElement(config.fileList);
    const fileListdiv = document.createElement('div');
    let fileListHtml = '<table id="fileList"><tr><th>' + i18n.msg_tableTitle_fileName +
      '</th><th>' + i18n.msg_tableTitle_fileSize +
      '</th><th>' + i18n.msg_tableTitle_fileDate + '</th></tr>';
    try {
      const {oss} = await Provide.getInstance(PLUGIN_ID);
      const data = await oss.list({
        prefix,
      });
      const files = data.objects;
      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        if (file['name'].lastIndexOf('/') !== file['name'].length - 1) {
          fileListHtml += '<tr><td>' + getFileName(file['name']) +
            '</td><td>' + getFileSize(file['size']) +
            '</td><td>' + getFileDate(file['lastModified']) +
            '</td></tr>';
        }
      }
      fileListdiv.innerHTML = fileListHtml;
      fileListSpace.appendChild(fileListdiv);
    } catch (error) {
      event.error = error.message;
    }

    return event;
  });

  kintone.events.on('app.record.edit.submit', async function(event) {
    const record = event.record;
    const files = attachment.getFiles();
    if (files.length <= 0) {
      return event;
    }
    const directory = record[config.directory]['value'];

    const fileList = [];
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i];
      let key = '';
      if (typeof directory !== 'undefined' && directory.length > 0) {
        key = directory + '/' + file.name;
      } else {
        key = file.name;
      }
      fileList.push({
        Key: key,
        Body: file
      });
    }

    try {
      const {oss} = await Provide.getInstance(PLUGIN_ID);
      swal.fire({
        html: `<div id="alertMessage">${i18n.msg_uploading}</div>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        onOpen: () => {
          swal.showLoading();
        },
      });
      await Promise.all(fileList.map((el) => oss.put(el.Key, el.Body)));
    } catch (error) {
      event.error = error;
    } finally {
      swal.close();
    }

    return event;
  });

})(jQuery, kintone.$PLUGIN_ID);