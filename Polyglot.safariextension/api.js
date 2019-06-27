import url from 'url'

const REQUEST_LIMIT_EXCEEDED =
  'Error: external API request limit exceeded. Please try again later.'

export async function translate(text, targetLanguage) {
  const query = url.format({
    query: {
      client: 'gtx',
      dt: 't',
      sl: 'auto',
      tl: targetLanguage,
      q: text,
    },
  })
  const endpoint = `http://translate.googleapis.com/translate_a/single${query}`

  const response = await fetch(endpoint)

  if (response.status === 503) {
    throw new Error(REQUEST_LIMIT_EXCEEDED)
  }

  const body = await response.text()

  if (body.includes('86640')) {
    throw new Error(REQUEST_LIMIT_EXCEEDED)
  }

  const data = JSON.parse(
    body.replace(/,,/g, ',null,').replace(/,,/g, ',null,')
  )
  const translatedText = data[0].map(sentence => sentence[0]).join('<br/>')
  return translatedText
}
