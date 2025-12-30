export type Idea = {
  id: string
  title: string
  content: string | null
  x_pos: number
  y_pos: number
  width: number
  height: number
  color: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  due_date: string | null
  idea_id: string | null
  created_at: string
  updated_at: string
}

export type Connection = {
  id: string
  from_id: string
  to_id: string
  label: string | null
  created_at: string
}
