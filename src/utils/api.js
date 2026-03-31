/** Parse Laravel paginated JSON from our API envelope { success, data: { data, meta?, ... } } */
export function unwrapPaginated(res) {
  const p = res.data?.data
  if (!p) {
    return { items: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 15 } }
  }
  const items = p.data ?? []
  const m = p.meta || {}
  return {
    items,
    meta: {
      current_page: m.current_page ?? p.current_page ?? 1,
      last_page: m.last_page ?? p.last_page ?? 1,
      total: m.total ?? p.total ?? 0,
      per_page: m.per_page ?? p.per_page ?? 15,
    },
  }
}

export function unwrapData(res) {
  return res.data?.data
}

export function unwrapList(res) {
  const d = res.data?.data
  return Array.isArray(d) ? d : (d?.data ?? [])
}
