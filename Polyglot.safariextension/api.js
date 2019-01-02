import url from 'url'
import 'whatwg-fetch' // eslint-disable-line import/no-unassigned-import

const REQUEST_LIMIT_EXCEEDED = 'Error: external API request limit exceeded. Please try again later.'

export async function translate(text, targetLanguage) {
  const query = url.format({
    query: {
      client: 'gtx',
      sl: 'auto',
      tl: targetLanguage,
      dt: 't',
      q: text,
    },
  })
  const endpoint = `http://translate.googleapis.com/translate_a/single${query}`

  try {
    const response = await fetch(endpoint)
    if (response.status === 503) {
      return REQUEST_LIMIT_EXCEEDED
    }
    const body = await response.text()
    const data = JSON.parse(
      body.replace(/,,/g, ',null,').replace(/,,/g, ',null,')
    )
    const translatedText = data[0].map(sentence => sentence[0]).join('<br/>')
    return translatedText
  } catch (err) {
    Promise.reject(err)
  }
}
