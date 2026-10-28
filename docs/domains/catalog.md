# Domain: catalog

- **Related:** [ADR-0020](../adr/0020-community-kit-catalog.md),
  [ADR-0005](../adr/0005-mongodb-as-database.md),
  [hoard](hoard.md),
  [greyhoarder/catalog](https://github.com/greyhoarder/catalog)

## Purpose

The catalog is the community's list of kits: what a box of miniatures can
become, and which armies it is sold for. Greyhoarder ships it with every
release, so users can add a box to their hoard without typing its
contents. Everyone on the instance sees the same catalog, and nobody on
the instance can change it.

The format of the catalog's files is described in the catalog
repository's README. This document covers what Greyhoarder does with it.

## Terms

| Term | Meaning |
|------|---------|
| **Catalog** | The kits and factions of the catalog repository, as of the commit a release ships. |
| **Snapshot** | The catalog as the server reads it from the submodule's files on startup, with a hash over its content. |
| **Catalog kit** | A kit from the catalog. Its id is its path in the catalog repository, e.g. `games-workshop/warhammer-40000/orks/boyz-2026`. |
| **Kit version** | One state of a catalog kit. A kit gets a new version whenever its content changes. |
| **Game system** | A game that armies belong to, e.g. Warhammer 40,000. |
| **Faction** | An army of a game system, e.g. Orks. Its id is `<system>/<faction>`. |
| **Group** | A block of factions for display, e.g. Xenos. It shares no kits. |
| **Part of** | A faction whose kits all apply to another faction as well, e.g. Blood Angels as part of Space Marines. |
| **Draft** | A catalog kit not yet checked against a physical box. |
| **Removed** | A catalog kit that is no longer in the snapshot. |

## Rules

### Source and import

- The catalog repository is the git submodule `libs/catalog/` of this
  repository. The commit it points to is the catalog of the release.
- On every start, the server reads the files into a snapshot and checks
  every file and every reference against the format Greyhoarder knows.
  Ranges are not part of the snapshot.
- A file or an entry that does not match the format, refers to a kit,
  faction or group that is not in the snapshot, or contains itself, also
  through other kits, is left out with a warning in the log. A faction
  whose group or parent faction, or a kit whose predecessor
  (`supersedes`), is not in the snapshot stays and only loses that
  reference, with a warning; the server still starts. A left-out entry keeps its
  last imported version and is not marked as removed. When a system's file
  is left out, all its factions keep theirs.
- The server imports the snapshot when it differs from the one imported
  last. Importing the same snapshot again changes nothing.
- An import either completes or leaves the previous catalog untouched.

### Versions

- A kit's id never changes; a changed kit gets a new version under the
  same id, and the older version stays.
- Unchanged kits keep their version, whatever else changed in the
  catalog.
- A kit that is missing from a snapshot is marked as removed and keeps
  all its versions. It is no longer offered for new boxes. If it comes
  back, it is offered again.
- Factions follow the same rules.

### Factions

- A catalog kit listed for a faction is offered for that faction and for
  every faction that is part of it, so a Space Marines kit is also offered
  to Blood Angels. This includes users' own factions that are part of a
  catalog faction (see [hoard](hoard.md)).
- A kit listed for a whole game system is offered to every faction of that
  system. This is only for minis that belong to every faction; terrain and
  accessories are not listed this way.
- The first faction of a kit is the army it is mainly sold for.
- Groups only sort factions for display.

### Using catalog kits

- Catalog kits are read-only for every user and every role.
- Kits marked as draft are offered like any other kit, but are marked as
  not checked.
- Every signed-in user can search the catalog kits by name, the name of
  any variant, product code or barcode, ignoring case. A search returns at most 50 kits, sorted by
  name; removed kits are not part of it.
- Every signed-in user can search the minis of the catalog: the names the
  slots of catalog kits can be built as, each once per faction (the
  slot's faction, or else each of its kit's factions), ignoring case, with
  the kits they come from and the parts those slots offer. A search
  matches the name or the name of a kit, returns at most 50 minis sorted
  by name, then faction, and leaves out removed kits.
- Every signed-in user can search the catalog factions by name, ignoring
  case, each with its game system.
- Adding a box from a catalog kit records the kit's id and version on the
  box. From then on the box and its minis follow the rules of the
  [hoard](hoard.md); a new kit version never changes them.

## Life of a catalog kit

1. A contributor adds a kit file to the catalog repository, marked as a
   draft.
2. The submodule is moved to a commit that contains it. The next release
   ships it, and instances import it as version 1.
3. Someone checks the kit against a box and corrects it. The next release
   imports version 2. Boxes added from version 1 stay as they are.

## Not part of this domain

- Users' own kits, boxes and minis: they belong to the [hoard](hoard.md).
- Contributing to the catalog from within Greyhoarder; users open pull
  requests in the catalog repository.
- Rules data, points and army lists.

## Open questions

- Whether users can give catalog factions aliases of their own ("DA").
- Whether users' own kits pick their factions from the catalog.
- Whether a catalog kit can be copied into a user's kit to change it.
- Whether an instance may later also fetch newer catalogs itself
  (ADR-0020 leaves room for it).
- How terrain and accessories are categorised, so they are not offered as
  minis of a faction, e.g. a kind of kit beside miniatures.
