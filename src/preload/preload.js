const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, func) => ipcRenderer.on(channel, func),
  },
})

contextBridge.exposeInMainWorld('electronAPI', {
  // 打开子窗口
  openChildWindow: () => ipcRenderer.send('open-child-window'),

  // 关闭子窗口
  closeChildWindow: () => ipcRenderer.send('close-child-window'),

  // 检测更新
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  // 监听更新可用事件
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update-available', (event, data) => callback(data)),

  // 监听无更新可用事件
  onNoUpdateAvailable: (callback) =>
    ipcRenderer.on('no-update-available', (event, data) => callback(data)),

  // 监听更新错误事件
  onUpdateError: (callback) =>
    ipcRenderer.on('update-error', (event, data) => callback(data)),

  // 下载更新
  downloadUpdate: () => ipcRenderer.send('download-update'),

  // 监听下载进度
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (event, data) => callback(data)),

  // 监听下载完成
  onDownloadCompleted: (callback) =>
    ipcRenderer.on('download-completed', (event, data) => callback(data)),

  // 监听下载错误
  onDownloadError: (callback) =>
    ipcRenderer.on('download-error', (event, data) => callback(data)),

  // 安装更新
  installUpdate: () => ipcRenderer.send('install-update'),

  // 监听安装错误
  onInstallError: (callback) =>
    ipcRenderer.on('install-error', (event, data) => callback(data)),
})
