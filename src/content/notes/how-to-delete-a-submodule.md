---
title: "How to Delete a Submodule"
date: "2021-03-15T17:38:40-04:00"
description: "This will be a quick article that lists steps needed to remove a submodule from a git repository."
topics:
  - git
  - submodules
ail: 0
---
This will be a quick article that lists steps needed to remove a submodule from a git repository.

## Submodule Removal

To remove a submodule you need to:

- Delete the relevant section from the .gitmodules file.
- Stage the .gitmodules changes git add .gitmodules
- Delete the relevant section from .git/config.
- Run git rm --cached path_to_submodule (no trailing slash).
- Run rm -rf .git/modules/path_to_submodule (no trailing slash).
- Commit git commit -m "Removed submodule "
- Delete the now untracked submodule files rm -rf path_to_submodule

## References

<https://gist.github.com/myusuf3/7f645819ded92bda6677>


