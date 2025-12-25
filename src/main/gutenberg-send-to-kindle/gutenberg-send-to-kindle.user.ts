import { v4 as uuidv4 } from 'uuid'
namespace GutenbergSendToKindle {
  interface InitResponse {
    uploadUrl: string
    stkToken: string
    statusCode: number
    expiryTime: number
  }

  interface UploadResponse {
    VersionID: string
    AssetType: string
    ETag: string
    'Content-Length': number
  }

  interface SendResponse {
    statusCode?: number
    message?: string
  }

  interface EpubInfo {
    url: string
    filename: string
    title: string | null
    author: string | null
  }

  enum HttpStatus {
    OK = 200,
  }

  const baseHeaders = {
    Origin: 'https://www.amazon.com',
    Referer: 'https://www.amazon.com/sendtokindle',
    'Content-Type': 'application/json',
  }

  const CSRFPattern = /name=["']csrfToken["'][^>]*value=["']([^"']+)["']/i
  const ContentLengthPattern = /content-length:\s*(\d+)/i
  const EPUB_CONTENT_TYPE = 'application/epub+zip'
  const TOAST_TIMEOUT_MS = 5000
  const AMAZON_SENDTOKINDLE_URL = 'https://www.amazon.com/sendtokindle'
  const LevelToClassMap: Record<string, string> = {
    info: 'gstk-toast--info',
    error: 'gstk-toast--error',
    success: 'gstk-toast--success',
  }

  let cachedCsrfToken: string | null = null

  // Helper to check HTTP status and throw on error
  const ensureStatus = (response: Tampermonkey.Response<unknown>, expectedStatus: number = HttpStatus.OK): void => {
    if (response.status !== expectedStatus) {
      throw new Error(`Request returned status ${response.status}`)
    }
  }

  // Helper to parse JSON response with error handling
  const parseJsonResponse = <T>(responseText: string): T => {
    try {
      return JSON.parse(responseText) as T
    } catch (e) {
      throw new Error(`Failed to parse response: ${e}`)
    }
  }

  const getCsrfToken = async (): Promise<string> => {
    if (cachedCsrfToken) {
      log('Using cached CSRF token')
      return cachedCsrfToken
    }

    log('Fetching CSRF token from Amazon sendtokindle page')
    const response = await GM.xmlHttpRequest({
      method: 'GET',
      url: AMAZON_SENDTOKINDLE_URL,
    })
    const html = response.responseText || ''

    // Detect the specific sign-in span used on the Amazon Send-to-Kindle UI.
    // If the following span exists on the page, the user is not signed in:
    // <span id="s2k-dnd-sign-in-button-text" class="s2k-dnd-button-text">Sign in</span>
    const signInSpanPattern = /<span[^>]*id=["']s2k-dnd-sign-in-button-text["'][^>]*>[\s\S]*?Sign\s*in[\s\S]*?<\/span>/i
    if (signInSpanPattern.test(html)) {
      log('getCsrfToken: found s2k sign-in span in amazon page response — user not signed in')
      throw new Error('NOT_LOGGED_IN')
    }

    const m = CSRFPattern.exec(html)
    if (m?.[1]) {
      cachedCsrfToken = m[1]
      log('Retrieved CSRF token', { token: cachedCsrfToken })
      return cachedCsrfToken
    }

    const excerpt = (html.substring(0, 1000) || '').split(/\s+/).join(' ')
    log('Warning: Could not find CSRF token in Amazon page excerpt:', excerpt)
    throw new Error('CSRF_NOT_FOUND')
  }

  const log = (message: string, data?: unknown) => {
    const timestamp = new Date().toISOString()
    if (data) {
      console.info(`[Gutenberg Send to Kindle ${timestamp}] ${message}`, data)
    } else {
      console.info(`[Gutenberg Send to Kindle ${timestamp}] ${message}`)
    }
  }

  // Inject stylesheet for UI elements (to avoid recreating inline styles)
  const injectStyles = () => {
    const styleId = 'gstk-injected-styles'
    if (document.getElementById(styleId)) {
      return
    }
    const css = `
      .gstk-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: opacity 0.2s ease;
      }
      .gstk-toast--error { background-color: #fee; color: #c00; border: 1px solid #fcc; }
      .gstk-toast--success { background-color: #efe; color: #060; border: 1px solid #cfc; }
      .gstk-toast--info { background-color: #eef; color: #006; border: 1px solid #ccf; }

      .gstk-button {
        padding: 8px 16px;
        background-color: #ff9900;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background-color 0.2s;
      }
      .gstk-button:hover { background-color: #ff9933; }
    `
    const styleEl = document.createElement('style')
    styleEl.id = styleId
    styleEl.textContent = css
    document.head?.appendChild(styleEl)
  }

  const showMessage = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const messageEl = document.createElement('div')
    const toastClass = LevelToClassMap[type] || 'gstk-toast--info'
    messageEl.classList.add('gstk-toast', toastClass)
    messageEl.textContent = message
    document.body.appendChild(messageEl)

    setTimeout(() => {
      messageEl.remove()
    }, TOAST_TIMEOUT_MS)
  }

  const getEpubInfo = (): EpubInfo | null => {
    // Locate EPUB3 download links: Gutenberg uses hrefs containing '.epub3.'
    // and the link text for EPUB3 is standardized. Prefer the exact text
    // "EPUB3 (E-readers incl. Send-to-Kindle)" and the href containing
    // '.epub3.'; fail gracefully if none are present.
    const epub3Candidates = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*=".epub3."]'))

    let epubLink: HTMLAnchorElement | null = null
    const exactEpub3Text = 'EPUB3 (E-readers incl. Send-to-Kindle)'

    // First, prefer an exact text match combined with .epub3. in href
    for (const a of epub3Candidates) {
      if ((a.textContent || '').trim() === exactEpub3Text) {
        epubLink = a
        log('EPUB3 link selected by exact text and href', { href: a.href })
        break
      }
    }

    if (!epubLink) {
      log('No EPUB3 link found on page; aborting')
      return null
    }

    const epubUrl = epubLink.href
    const filename = epubUrl.split('/').pop() || 'book.epub'

    // Extract title/author from document.title (format: "Title by Author | Project Gutenberg")
    let title: string | null = null
    let author: string | null = null
    try {
      const pageTitle = (document.title || '').split('|')[0].trim()
      // Split on the last occurrence of ' by '
      const lastBy = pageTitle.toLowerCase().lastIndexOf(' by ')
      if (lastBy !== -1) {
        title = pageTitle.substring(0, lastBy).trim()
        author = pageTitle.substring(lastBy + 4).trim()
      }
      log('Title/author extracted from document.title', { title, author })
    } catch (e) {
      log('Failed to extract title/author from document.title', e)
    }

    log('Found EPUB info', {
      filename,
      title,
      author,
      epubUrl,
    })

    return { url: epubUrl, filename, title, author }
  }

  const downloadEpub = async (url: string): Promise<ArrayBuffer> => {
    log(`Downloading EPUB from ${url}`)
    const response = await GM.xmlHttpRequest({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    }).catch(e => {
      log(`Failed to download EPUB: ${e}`)
      throw e
    })
    log(`EPUB downloaded successfully, size: ${response.response.byteLength} bytes`)
    return response.response as ArrayBuffer
  }

  const headEpub = async (url: string): Promise<number | null> => {
    log(`Performing HEAD request for EPUB: ${url}`)
    const response = await GM.xmlHttpRequest({ method: 'HEAD', url }).catch(e => {
      log('HEAD request failed', e)
      return null
    })
    const headers = response?.responseHeaders || ''
    const m = new RegExp(ContentLengthPattern).exec(headers)
    if (m?.[1]) {
      const size = Number.parseInt(m[1], 10)
      log('HEAD returned Content-Length', size)
      return size
    } else {
      log('HEAD did not return Content-Length')
      return null
    }
  }

  const initSendToKindle = async (fileSize: number, csrfToken: string): Promise<InitResponse> => {
    log('Initializing Send to Kindle', { fileSize })
    const payload = {
      fileSize,
      contentType: EPUB_CONTENT_TYPE,
      appVersion: '1.0',
      appName: 'drag_drop_web',
      fileExtension: 'epub',
    }

    log('Sending init request to Amazon (/sendtokindle/init)')
    const response = await GM.xmlHttpRequest({
      method: 'POST',
      url: `${AMAZON_SENDTOKINDLE_URL}/init`,
      headers: {
        ...baseHeaders,
        'anti-csrftoken-a2z': csrfToken,
        Accept: '*/*',
      },
      data: JSON.stringify(payload),
    }).catch(e => {
      log('Init request failed', e)
      throw e
    })
    log('Init response status', response.status)
    ensureStatus(response)
    const data = parseJsonResponse<InitResponse>(response.responseText)
    log('Init response received', data)
    if (data.statusCode !== 0) {
      throw new Error(`Init failed with status code: ${data.statusCode}`)
    }
    return data
  }

  const uploadEpub = async (uploadUrl: string, epubData: ArrayBuffer, csrfToken: string): Promise<UploadResponse> => {
    log('Uploading EPUB to Kindle', {
      uploadUrl,
      dataSize: epubData.byteLength,
    })
    log('Sending upload request')
    const response = await GM.xmlHttpRequest({
      method: 'PUT',
      url: uploadUrl,
      headers: {
        ...baseHeaders,
        'Content-Type': EPUB_CONTENT_TYPE,
        'anti-csrftoken-a2z': csrfToken,
      },
      data: epubData,
      responseType: 'arraybuffer',
    }).catch(e => {
      log(`Upload request failed: ${e}`)
      throw e
    })
    log('Upload response status', response.status)
    ensureStatus(response)
    const text = new TextDecoder().decode(response.response as ArrayBuffer)
    const data = parseJsonResponse<UploadResponse>(text)
    log('Upload response received', data)
    return data
  }

  const sendToKindle = async (
    stkToken: string,
    title: string,
    author: string,
    contentLength: number,
    filename: string,
    csrfToken: string,
  ): Promise<SendResponse> => {
    log('Sending to Kindle', {
      stkToken,
      title,
      author,
      contentLength,
      filename,
    })

    const payload = {
      stkToken,
      title,
      author,
      extName: 'drag_drop_web',
      inputFormat: 'epub',
      extVersion: '1.0',
      dataType: EPUB_CONTENT_TYPE,
      stkGuid: '',
      archive: true,
      fileSize: contentLength,
      forceConvert: 'false',
      inputFileName: filename,
      batchId: uuidv4(),
    }

    log('Sending final send request (/sendtokindle/send-v2)')
    const response = await GM.xmlHttpRequest({
      method: 'POST',
      url: `${AMAZON_SENDTOKINDLE_URL}/send-v2`,
      headers: {
        ...baseHeaders,
        'anti-csrftoken-a2z': csrfToken,
        Accept: '*/*',
      },
      data: JSON.stringify(payload),
    }).catch(e => {
      log(`Send request failed: ${e}`)
      throw e
    })
    log('Send response status', response.status)
    ensureStatus(response)
    const data = parseJsonResponse<SendResponse>(response.responseText)
    log('Send response received', data)
    return data
  }

  const sendEpubToKindle = async () => {
    try {
      showMessage('Preparing to send to Kindle...', 'info')
      log('Starting send to Kindle process')

      // FIRST: collect all information from the Gutenberg page (no Amazon calls)
      log('Retrieving EPUB info from page')
      const epubInfo = getEpubInfo()
      if (!epubInfo) {
        showMessage('Could not find EPUB3 version on this page', 'error')
        log('Aborting: no EPUB3 found on page')
        return
      }

      // If title or author is missing or unknown, prompt the user and halt if they cancel
      if (!epubInfo.title || !epubInfo.author) {
        showMessage('Sending cancelled — title/author required.', 'error')
        return
      }

      // Attempt HEAD to learn file size without downloading the whole EPUB
      const headSize = await headEpub(epubInfo.url)

      if (!headSize) {
        // HEAD didn't provide size — fail gracefully
        log('HEAD did not provide Content-Length; aborting send to Kindle.')
        showMessage('Unable to determine EPUB size; cannot send to Kindle.', 'error')
        return
      }

      // NOW: contact Amazon (CSRF, cookies, init/upload/send)
      log('Fetching CSRF token from Amazon (deferred until metadata ready)')
      let csrfToken: string
      try {
        csrfToken = await getCsrfToken()
      } catch (error) {
        let msg: string
        if (error instanceof Error) {
          msg = error.message
        } else {
          msg = String(error)
        }
        if (msg === 'NOT_LOGGED_IN') {
          showMessage('You must be signed into Amazon for Send to Kindle to work. Please sign in and try again.', 'error')
          log('User not signed into Amazon (CSRF fetch indicated login page)')
          return
        }
        if (msg === 'CSRF_NOT_FOUND') {
          showMessage("Could not read Amazon's security token. Try refreshing Amazon or logging in.", 'error')
          log('CSRF token not found in Amazon page response', error)
          return
        }

        showMessage('Unable to fetch security token from Amazon. Please refresh and try again.', 'error')
        log('Failed to get CSRF token', error)
        return
      }

      // Step 1: Initialize
      log('Step 1: Initializing Send to Kindle', { fileSize: headSize })
      const initData = await initSendToKindle(headSize, csrfToken)

      log('Downloading EPUB after init to prepare upload')
      const epubData = await downloadEpub(epubInfo.url)

      // Step 2: Upload
      log('Step 2: Uploading EPUB')
      const uploadData = await uploadEpub(initData.uploadUrl, epubData, csrfToken)

      // Step 3: Send to Kindle
      log('Step 3: Sending to Kindle')
      const sendData = await sendToKindle(
        initData.stkToken,
        epubInfo.title,
        epubInfo.author,
        uploadData['Content-Length'],
        epubInfo.filename,
        csrfToken,
      )

      log('Send to Kindle completed successfully', sendData)
      showMessage(`Sent "${epubInfo.title}" to your Kindle!`, 'success')
    } catch (error) {
      let errorMessage: string
      if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = String(error)
      }
      log('Error sending to Kindle', error)
      showMessage(`Error: ${errorMessage}`, 'error')
    }
  }

  const addSendToKindleButton = () => {
    // Check if EPUB3 is available
    let epubLink: HTMLAnchorElement | null = null
    const epubLinks = document.querySelectorAll('a[class*="link"][title*="Download"]')
    for (const link of epubLinks) {
      if (link.textContent.includes('Send-to-Kindle')) {
        epubLink = link as HTMLAnchorElement
        break
      }
    }
    if (!epubLink) {
      log('No EPUB3 version available on this page')
      return
    }

    // Create button container
    const buttonContainer = document.createElement('div')
    // Add left margin so there's space between the preceding link and the button
    buttonContainer.style.cssText = `
      margin: 8px 0 8px 8px;
      display: inline-block;
    `

    // Create send to Kindle button
    const button = document.createElement('button')
    button.textContent = '📧 Send to Kindle'
    button.classList.add('gstk-button')

    button.addEventListener('click', e => {
      e.preventDefault()
      button.disabled = true
      button.textContent = '⏳ Sending...'
      sendEpubToKindle().finally(() => {
        button.disabled = false
        button.textContent = '📧 Send to Kindle'
      })
    })

    buttonContainer.appendChild(button)

    // Insert button into the page as next sibling to epub link
    epubLink.after(buttonContainer)

    log('Send to Kindle button added successfully')
  }

  export const main = () => {
    injectStyles()
    addSendToKindleButton()
  }
}
GutenbergSendToKindle.main()
