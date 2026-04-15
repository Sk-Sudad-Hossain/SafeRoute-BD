export function createCategory(payload = {}) {
  return {
    id: payload._id ?? "",
    name: payload.name ?? "",
    description: payload.description ?? ""
  };
}