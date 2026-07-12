import { AxiosRenderer } from "./axios-renderer.js";

export class RendererFactory {
  static create(authManager, linkValidator, config = {}) {
    // Commit 2 will add PlaywrightRenderer based on config.render
    return new AxiosRenderer(authManager, linkValidator, config);
  }
}
