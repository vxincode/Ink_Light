declare module "rss" {
  interface RSSItemOptions {
    title?: string
    description?: string
    url?: string
    guid?: string
    categories?: string[]
    author?: string
    date?: Date
    enclosure?: any
  }

  interface RSSOptions {
    title?: string
    description?: string
    feed_url?: string
    site_url?: string
    image_url?: string
    author?: string
    categories?: string[]
    pubDate?: Date
    language?: string
    ttl?: number
  }

  export default class RSS {
    constructor(options: RSSOptions)
    item(options: RSSItemOptions): this
    xml(): string
  }
}
