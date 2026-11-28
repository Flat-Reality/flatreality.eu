export const andyScarlett = {
  id: 'andy-scarlett',
  name: 'Andy Scarlett',
  image: '/assets/images/AndyScarlett.png'
}

export function channelByline(article) {
  if (article.content?.author !== andyScarlett.id) return ''
  return `<div class="channel-byline"><img src="${andyScarlett.image}" alt="" width="36" height="36"><span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${andyScarlett.name}</span></span></div>`
}
