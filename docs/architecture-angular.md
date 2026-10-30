# Architecture: Angular

Rules for Angular code in the client. Where client code lives is covered in
[architecture-boundaries-client.md](architecture-boundaries-client.md), components and
styling in [architecture-ui.md](architecture-ui.md).

## Modern Angular only

- Use only standalone components, signals, `inject()`, native control flow
  and zoneless change detection.
- No NgModules, no `*ngIf`/`*ngFor`, no constructor injection.
- Prefer signals and `resource`/`httpResource` over manual RxJS
  subscriptions in components.
- Check current APIs via the Angular CLI MCP server instead of memory.

_(derived from [ADR-0002](adr/0002-angular-as-client-framework.md))_
