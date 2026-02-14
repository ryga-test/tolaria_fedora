export interface VaultEntry {
  path: string
  filename: string
  title: string
  isA: string | null
  aliases: string[]
  belongsTo: string[]
  relatedTo: string[]
  status: string | null
  owner: string | null
  cadence: string | null
  modifiedAt: number | null
  fileSize: number
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: number // unix timestamp
}

export type SidebarSelection =
  | { kind: 'filter'; filter: 'all' | 'people' | 'events' | 'favorites' | 'trash' }
  | { kind: 'sectionGroup'; type: string }
  | { kind: 'entity'; entry: VaultEntry }
  | { kind: 'topic'; entry: VaultEntry }
