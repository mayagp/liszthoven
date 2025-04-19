export var lastId = 0;

export function UniqueComponentId() {
  let prefix = 'fc_id_';
  lastId++;
  return `${prefix}${lastId}`;
}
