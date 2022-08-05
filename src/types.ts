export interface User {
  username: string
  hash: string
  fullname: string
}

export interface Domain {
  id: string
}

export interface Metric {
  id: string
  DomainId: string
}
