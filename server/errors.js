class EntityNotFoundError extends Error {
  constructor(entityName = 'unknown') {
    super(`Entity ${entityName} not found`);
    this.name = 'EntityNotFoundError';
  }
}

module.exports = {
  EntityNotFoundError
}
