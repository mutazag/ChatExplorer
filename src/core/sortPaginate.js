export function sortConversations(conversations) {
  return [...conversations].sort((a, b) => {
    const au = a.update_time ?? a.create_time ?? 0;
    const bu = b.update_time ?? b.create_time ?? 0;
    return bu - au; // descending: newest first
  });
}

export function paginate(items, page = 1, pageSize = 25) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total,
    page: current,
    pages,
    pageSize,
  };
}
