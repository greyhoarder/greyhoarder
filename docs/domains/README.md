# Domains

One file per domain with business concepts worth describing: its terms,
the rules that hold for them and how its data moves through its life. Read
the file of the domain you work in. Which domains exist and how they may
depend on each other is covered in
[architecture-boundaries.md](../architecture-boundaries.md).

Domain docs describe the current model, not a decision record: they are
updated in place when the model changes. Field names and types live in
code (`libs/domain/<domain>/` and the domain's `model/` in each app), not
here.

| Domain | Covers |
|--------|--------|
| [catalog](catalog.md) | The community kit catalog: catalog kits, their versions, factions |
| [hoard](hoard.md) | Boxes, kits, minis, groups, parts, the workbench |
