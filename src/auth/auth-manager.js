export class AuthManager {
  constructor(config = {}) {
    this.cookies = config.cookies || "";
    this.auth = config.auth || ""; // Bearer token
    this.username = config.username || "";
    this.password = config.password || "";
  }

  getHeaders() {
    const headers = {};
    
    if (this.auth) {
      const token = this.auth.startsWith("Bearer ") ? this.auth : `Bearer ${this.auth}`;
      headers["Authorization"] = token;
    } else if (this.username || this.password) {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    if (this.cookies) {
      headers["Cookie"] = this.cookies;
    }

    return headers;
  }
}
