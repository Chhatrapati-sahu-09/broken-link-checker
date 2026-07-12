export class DbService {
  constructor(config = {}) {
    this.config = config;
  }

  async saveScan(results) {
    // Commit 8 will integrate SQLite persistence
    return true;
  }
}
