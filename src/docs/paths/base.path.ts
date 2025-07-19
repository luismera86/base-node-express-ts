import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export abstract class BasePath {
  protected registry: OpenAPIRegistry;

  constructor(registry?: OpenAPIRegistry) {
    this.registry = registry || new OpenAPIRegistry();
  }

  abstract register(): void;
}
