const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { autoUpdater } = require('electron-updater')
let parent = null
let child = null

// 配置自动更新参数
function setupAutoUpdater() {
  // 启用日志
  autoUpdater.logger = require('electron-log')
  autoUpdater.logger.transports.file.level = 'info'
  
  // 设置自动下载为false，手动触发下载
  autoUpdater.autoDownload = false
  
  // 禁用自动安装，由用户确认后手动安装
  autoUpdater.autoInstallOnAppQuit = false
  
  // 检查更新出错
  autoUpdater.on('error', (error) => {
    if (parent) {
      parent.webContents.send('update-error', {
        error: error.message
      })
    }
    autoUpdater.logger.error('更新错误', error)
  })
  
  // 检查到新版本
  autoUpdater.on('update-available', (info) => {
    autoUpdater.logger.info('检测到新版本', info)
    if (parent) {
      parent.webContents.send('update-available', {
        currentVersion: app.getVersion(),
        latestVersion: info.version || '未知',
        updateInfo: '有新版本可用',
        releaseNotes: info.releaseNotes || '暂无更新说明',
        releaseDate: info.releaseDate
      })
    }
  })
  
  // 没有新版本
  autoUpdater.on('update-not-available', (info) => {
    autoUpdater.logger.info('当前已是最新版本', info)
    if (parent) {
      parent.webContents.send('no-update-available', {
        currentVersion: app.getVersion(),
        message: '当前已是最新版本'
      })
    }
  })
  
  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    autoUpdater.logger.info('下载进度', progressObj)
    if (parent) {
      parent.webContents.send('download-progress', {
        progress: progressObj.percent || 0,
        receivedBytes: progressObj.transferred || 0,
        totalBytes: progressObj.total || 0,
        bytesPerSecond: progressObj.bytesPerSecond || 0
      })
    }
  })
  
  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.logger.info('更新已下载', info)
    if (parent) {
      parent.webContents.send('download-completed', {
        message: '更新下载完成，准备安装',
        version: info.version,
        releaseNotes: info.releaseNotes
      })
    }
  })
}

const createWindow = () => {
  parent = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  parent.loadFile(path.join(__dirname, './index.html'))
  
  // 设置自动更新
  setupAutoUpdater()
}

app.whenReady().then(() => {
  createWindow()
  
  // 应用启动后，自动检查更新
  // 开发环境下不检查更新，避免干扰开发流程
  if (!app.isPackaged) {
    autoUpdater.logger.info('开发环境，跳过更新检查')
  } else {
    // 生产环境延迟检查更新，避免影响应用启动速度
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        autoUpdater.logger.error('启动时检查更新失败', err)
      })
    }, 3000)
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

// 打开子窗口
ipcMain.on('open-child-window', (event, message) => {
  child = new BrowserWindow({
    parent,
    width: 800,
    height: 600,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  child.loadFile(path.join(__dirname, './child.html'))
})

// 关闭子窗口
ipcMain.on('close-child-window', (event, message) => {
  if (child) {
    child.close()
    child = null
  }
})

// 检测更新
ipcMain.on('check-for-updates', (event) => {
  try {
    autoUpdater.checkForUpdates().catch(error => {
      event.reply('update-error', {
        error: '检查更新失败: ' + error.message
      })
      autoUpdater.logger.error('手动检查更新失败', error)
    })
  } catch (error) {
    event.reply('update-error', {
      error: '检查更新失败: ' + error.message
    })
    autoUpdater.logger.error('检查更新异常', error)
  }
})

// 下载更新
ipcMain.on('download-update', (event) => {
  try {
    autoUpdater.downloadUpdate().catch(error => {
      event.reply('download-error', {
        error: '下载更新失败: ' + error.message
      })
      autoUpdater.logger.error('下载更新失败', error)
    })
  } catch (error) {
    event.reply('download-error', {
      error: '下载更新失败: ' + error.message
    })
    autoUpdater.logger.error('下载更新异常', error)
  }
})

// 安装更新
ipcMain.on('install-update', (event) => {
  try {
    autoUpdater.quitAndInstall(true, true)
  } catch (error) {
    event.reply('install-error', {
      error: '安装更新失败: ' + error.message
    })
    autoUpdater.logger.error('安装更新异常', error)
  }
})
