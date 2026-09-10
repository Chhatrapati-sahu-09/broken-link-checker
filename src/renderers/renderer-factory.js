import { AxiosRenderer } from "./axios-renderer.js";
import { PlaywrightRenderer } from "./playwright-renderer.js";

export class RendererFactory {
  static create(authManager, linkValidator, config = {}) {
    if (config.render) {
      return new PlaywrightRenderer(authManager, linkValidator, config);
    }
    return new AxiosRenderer(authManager, linkValidator, config);
  }
}
