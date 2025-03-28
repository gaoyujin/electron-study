const openBtn = document.getElementById('open-btn')
const closeBtn = document.getElementById('close-btn')
const checkUpdateBtn = document.getElementById('check-update-btn')
const updateStatus = document.getElementById('update-status')
const progressContainer = document.getElementById('download-progress-container')
const progressBar = document.getElementById('download-progress')

// 格式化文件大小
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

if (openBtn) {
  // 打开窗口
  openBtn.addEventListener('click', () => {
    window.electronAPI.openChildWindow()
  })
}

if (closeBtn) {
  // 关闭子窗口
  closeBtn.addEventListener('click', () => {
    window.electronAPI.closeChildWindow()
  })
}

if (checkUpdateBtn) {
  // 检测更新
  checkUpdateBtn.addEventListener('click', () => {
    if (updateStatus) {
      updateStatus.textContent = '正在检查更新...'
      if (progressContainer) {
        progressContainer.style.display = 'none'
      }
    }
    window.electronAPI.checkForUpdates()
  })

  // 监听更新可用
  window.electronAPI.onUpdateAvailable((data) => {
    if (updateStatus) {
      let releaseNotesHtml = ''
      if (data.releaseNotes) {
        releaseNotesHtml = `<div class="release-notes">
          <h4>更新内容：</h4>
          <p>${data.releaseNotes}</p>
        </div>`
      }

      updateStatus.innerHTML = `${data.updateInfo}（当前版本: ${data.currentVersion}，最新版本: ${data.latestVersion}）
        ${releaseNotesHtml}
        <button id="download-btn">下载更新</button>`

      // 添加下载按钮事件
      const downloadBtn = document.getElementById('download-btn')
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          updateStatus.textContent = '正在准备下载更新...'
          window.electronAPI.downloadUpdate()
        })
      }
    }
  })

  // 监听无更新可用
  window.electronAPI.onNoUpdateAvailable((data) => {
    if (updateStatus) {
      updateStatus.textContent = `${data.message}（版本: ${data.currentVersion}）`
    }
  })

  // 监听更新错误
  window.electronAPI.onUpdateError((data) => {
    if (updateStatus) {
      updateStatus.textContent = `更新出错: ${data.error}`
      if (progressContainer) {
        progressContainer.style.display = 'none'
      }
    }
  })

  // 监听下载进度
  window.electronAPI.onDownloadProgress((data) => {
    if (progressContainer && progressBar) {
      progressContainer.style.display = 'block'
      progressBar.style.width = `${data.progress}%`

      let speedText = data.bytesPerSecond
        ? `(${formatBytes(data.bytesPerSecond)}/s)`
        : ''
      updateStatus.textContent = `下载中: ${formatBytes(
        data.receivedBytes
      )} / ${formatBytes(data.totalBytes)} (${Math.round(
        data.progress
      )}%) ${speedText}`
    }
  })

  // 监听下载完成
  window.electronAPI.onDownloadCompleted((data) => {
    if (updateStatus) {
      let versionInfoHtml = data.version ? `<p>版本: ${data.version}</p>` : ''
      let releaseNotesHtml = ''

      if (data.releaseNotes) {
        releaseNotesHtml = `<div class="release-notes">
          <h4>更新内容：</h4>
          <p>${data.releaseNotes}</p>
        </div>`
      }

      updateStatus.innerHTML = `${data.message}
        ${versionInfoHtml}
        ${releaseNotesHtml}
        <button id="install-btn">立即安装</button>`

      // 添加安装按钮事件
      const installBtn = document.getElementById('install-btn')
      if (installBtn) {
        installBtn.addEventListener('click', () => {
          updateStatus.textContent = '正在启动安装程序...'
          window.electronAPI.installUpdate()
        })
      }
    }
  })

  // 监听下载错误
  window.electronAPI.onDownloadError((data) => {
    if (updateStatus) {
      updateStatus.textContent = `下载失败: ${data.error}`
      if (progressContainer) {
        progressContainer.style.display = 'none'
      }
    }
  })

  // 监听安装错误
  window.electronAPI.onInstallError((data) => {
    if (updateStatus) {
      updateStatus.textContent = `安装失败: ${data.error}`
    }
  })
}
