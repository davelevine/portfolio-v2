---
title: "How to Remove Packages With Dependencies"
date: "2021-05-08T23:51:32-04:00"
description: "When removing a package on an Arch based system like Manjaro, Pacman will only remove what you tell it to, which leaves a number of dependencies left behind. This will be a quick article on how to remove packages and their dependencies."
topics:
  - manjaro
  - pacman
ail: 0
---
When removing a package on an Arch based system like Manjaro, Pacman will only remove what you tell it to, which leaves a number of dependencies left behind. This will be a quick article on how to remove packages and their dependencies.

## Remove a Package and it's Dependencies

In a Linux shell, type the following:

```bash
yaourt -Rcs <package>
```

`R` remove  
`c` Remove packages that are no longer installed from the cache as well as currently unused sync databases  
`s` Remove each target specified including all of their dependencies, provided that (A) they are not required by other packages; and (B) they were not explicitly installed by the user.  

## References

* <https://blog.stigok.com/2017/05/12/remove-package-with-dependencies-arch-pacman-yaourt.html>
* <https://linuxhint.com/remove_package_dependencies_pacman_arch_linux/>


