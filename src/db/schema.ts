import { relations } from "drizzle-orm";
import { boolean, date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("projects_user_id_idx").on(table.userId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    dueDate: date("due_date"),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("tasks_user_id_idx").on(table.userId)],
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const backlogItems = pgTable(
  "backlog_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),
    status: text("status").notNull().default("not_started"),
    priority: text("priority").notNull().default("medium"),
    rating: integer("rating"),
    startedAt: date("started_at"),
    completedAt: date("completed_at"),
    url: text("url"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("backlog_items_user_id_idx").on(table.userId)],
);

export const feedSources = pgTable(
  "feed_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    sourceType: text("source_type").notNull().default("rss"),
    enabled: boolean("enabled").notNull().default(true),
    lastFetchedAt: timestamp("last_fetched_at"),
    fetchError: text("fetch_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("feed_sources_user_id_idx").on(table.userId)],
);

export const feedItems = pgTable(
  "feed_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => feedSources.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    author: text("author"),
    thumbnailUrl: text("thumbnail_url"),
    publishedAt: timestamp("published_at"),
    isRead: boolean("is_read").notNull().default(false),
    isSaved: boolean("is_saved").notNull().default(false),
    convertedToTaskId: uuid("converted_to_task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    convertedToBacklogId: uuid("converted_to_backlog_id").references(() => backlogItems.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("feed_items_user_id_idx").on(table.userId),
    index("feed_items_source_id_idx").on(table.sourceId),
    index("feed_items_url_user_idx").on(table.userId, table.url),
  ],
);

export const subtasks = pgTable(
  "subtasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("subtasks_task_id_idx").on(table.taskId),
    index("subtasks_user_id_idx").on(table.userId),
  ],
);

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  backlogItems: many(backlogItems),
}));

export const backlogItemsRelations = relations(backlogItems, ({ one }) => ({
  category: one(categories, {
    fields: [backlogItems.categoryId],
    references: [categories.id],
  }),
}));

export const feedSourcesRelations = relations(feedSources, ({ many }) => ({
  items: many(feedItems),
}));

export const feedItemsRelations = relations(feedItems, ({ one }) => ({
  source: one(feedSources, {
    fields: [feedItems.sourceId],
    references: [feedSources.id],
  }),
  convertedTask: one(tasks, {
    fields: [feedItems.convertedToTaskId],
    references: [tasks.id],
  }),
  convertedBacklog: one(backlogItems, {
    fields: [feedItems.convertedToBacklogId],
    references: [backlogItems.id],
  }),
}));
