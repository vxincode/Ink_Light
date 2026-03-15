// Drizzle ORM 类型
import type {
  users,
  posts,
  tags,
  albums,
  photos,
  comments,
  friendLinks,
  siteSettings,
} from '@/db/schema'
import type { relations } from 'drizzle-orm'

// 基础类型推断
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type Album = typeof albums.$inferSelect
export type NewAlbum = typeof albums.$inferInsert

export type Photo = typeof photos.$inferSelect
export type NewPhoto = typeof photos.$inferInsert

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type FriendLink = typeof friendLinks.$inferSelect
export type NewFriendLink = typeof friendLinks.$inferInsert

export type SiteSettings = typeof siteSettings.$inferSelect
export type NewSiteSettings = typeof siteSettings.$inferInsert

// 枚举类型
export type PostCategory = 'ESSAY' | 'TRAVEL'
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type LinkStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE'
export type Role = 'USER' | 'ADMIN'

// 组合类型
export type PostWithAuthor = Post & {
  author: Pick<User, 'id' | 'name' | 'avatar'>
}

export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'name' | 'avatar'>
  tags: Array<{ tag: Tag }>
  _count?: {
    comments: number
  }
}

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[]
  user?: Pick<User, 'id' | 'name' | 'avatar'>
}

export type AlbumWithPhotos = Album & {
  author: Pick<User, 'id' | 'name'>
  photos: Photo[]
  _count?: {
    photos: number
  }
}
