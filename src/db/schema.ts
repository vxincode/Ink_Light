import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  type PgTableFn,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { enum: ['USER', 'ADMIN'] }).default('USER').notNull(),
  avatar: varchar('avatar', { length: 500 }),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}))

// 文章分类枚举
export const postCategoryEnum = ['ESSAY', 'TRAVEL'] as const
export type PostCategory = typeof postCategoryEnum[number]

// 文章状态枚举
export const postStatusEnum = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const
export type PostStatus = typeof postStatusEnum[number]

// 文章表
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: varchar('cover_image', { length: 500 }),
  category: varchar('category', { enum: postCategoryEnum }).default('ESSAY').notNull(),
  status: varchar('status', { enum: postStatusEnum }).default('DRAFT').notNull(),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  categoryStatusIdx: index('posts_category_status_idx').on(table.category, table.status),
  publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
}))

// 标签表
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
})

// 文章标签关联表
export const postTags = pgTable('post_tags', {
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: index('post_tags_pk').on(table.postId, table.tagId),
}))

// 相册表
export const albums = pgTable('albums', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 500 }),
  order: integer('order').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  orderIdx: index('albums_order_idx').on(table.order),
}))

// 照片表
export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: varchar('url', { length: 500 }).notNull(),
  caption: text('caption'),
  order: integer('order').default(0).notNull(),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  albumId: uuid('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
}, (table) => ({
  albumOrderIdx: index('photos_album_order_idx').on(table.albumId, table.order),
}))

// 评论表 - 使用函数声明避免循环引用问题
const createCommentsTable = (pgTable: PgTableFn) => pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  postApprovedIdx: index('comments_post_approved_idx').on(table.postId, table.isApproved),
  parentIdx: index('comments_parent_idx').on(table.parentId),
}))

export const comments = createCommentsTable(pgTable)

// 友链状态枚举
export const linkStatusEnum = ['PENDING', 'ACTIVE', 'INACTIVE'] as const
export type LinkStatus = typeof linkStatusEnum[number]

// 友链表
export const friendLinks = pgTable('friend_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  description: text('description'),
  status: varchar('status', { enum: linkStatusEnum }).default('PENDING').notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 网站设置表
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteName: varchar('site_name', { length: 100 }).default('我的博客').notNull(),
  siteDescription: text('site_description'),
  siteAvatar: varchar('site_avatar', { length: 500 }),
  seoKeywords: varchar('seo_keywords', { length: 255 }),
  githubUrl: varchar('github_url', { length: 255 }),
  twitterUrl: varchar('twitter_url', { length: 255 }),
  weiboUrl: varchar('weibo_url', { length: 255 }),
  email: varchar('email', { length: 255 }),
  footerText: text('footer_text'),
  icpNumber: varchar('icp_number', { length: 100 }),
  policeNumber: varchar('police_number', { length: 100 }),
  allowComments: boolean('allow_comments').default(true).notNull(),
  allowRegister: boolean('allow_register').default(false).notNull(),
  postsPerPage: integer('posts_per_page').default(10).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  albums: many(albums),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  tags: many(postTags),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}))

export const albumsRelations = relations(albums, ({ one, many }) => ({
  author: one(users, {
    fields: [albums.authorId],
    references: [users.id],
  }),
  photos: many(photos),
}))

export const photosRelations = relations(photos, ({ one }) => ({
  album: one(albums, {
    fields: [photos.albumId],
    references: [albums.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}))
