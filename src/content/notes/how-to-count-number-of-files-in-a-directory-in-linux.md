---
title: "How to Count Number of Files in a Directory in Linux"
date: "2021-03-06T21:42:11+00:00"
description: "This article will list all the ways to obtain the number of files in a directory in any flavor of Linux. It will be a copy/paste from a professionally written article."
topics:
  - linux
ail: 0
---
This article will list all the ways to obtain the number of files in a directory in any flavor of Linux. It will be a copy/paste from a professionally written article.

### Count number of files in directory in Linux

Let me first show you the content of the test directory I am going to use in this tutorial:

```bash
abhishek@linuxhandbook:~/tutorials$ ls -la
total 64
drwxr-xr-x 4 abhishek abhishek 4096 Apr 29 17:53 .
drwxr-xr-x 55 abhishek abhishek 4096 Apr 29 15:50 ..
-rwxr–r– 1 abhishek abhishek 456 Mar 6 16:21 agatha.txt
-rw-r–r– 1 abhishek abhishek 0 Apr 16 19:53 .a.t
-rwxr–r– 1 abhishek abhishek 140 Mar 22 16:41 bash_script.sh
-rw-rw-r– 1 abhishek abhishek 95 Feb 11 13:12 cpluplus.cpp
-rw-r–r– 1 abhishek abhishek 1778 Apr 29 16:16 my_zip_folder.zip
drwxr-xr-x 4 abhishek abhishek 4096 Apr 19 19:07 newdir
-rw-r–r– 1 abhishek abhishek 163 Apr 13 15:07 prog.py
-rw-r–r– 1 abhishek abhishek 19183 Mar 18 18:46 services
-rw-r–r– 1 abhishek abhishek 356 Dec 11 21:35 sherlock.txt
-rwxrw-r– 1 abhishek abhishek 72 Jan 21 15:44 sleep.sh
drwxr-xr-x 3 abhishek abhishek 4096 Jan 4 20:10 target
```

You can see that it has 9 files (including one hidden file) and 2 sub-directories in that directory. But you don’t have to do it manually. Let’s count the number of files using Linux commands.

### Count number of files and directories (without hidden files)

You can simply run the combination of the ls and wc command and it will display the number of files:

```bash
ls | wc -l
```

This is the output:

abhishek@linuxhandbook:~/tutorials$ ls \| wc -l  
10

There is a problem with this command. It counts all the files and directories in the current directories. But it doesn’t see the hidden files (the files that have name starting with a dot).

This is the reason why the above command showed me a count of 10 files instead of 11 (9 files and 2 directories).

### Count number of files and directories including hidden files

You probably already know that [-a option of ls command shows the hidden files](https://linuxhandbook.com/ls-command/). But if you use the ls -a command, it also displays the . (present directory) and .. (parent directory). This is why you need to use -A option that displays the hidden files excluding . and .. directories.

```bash
ls -A | wc -l
```

This will give you the correct count of files and directories in the current directory. Have a look at the output that shows a count of 11 (9 files and 2 directories):

abhishek@linuxhandbook:~/tutorials$ ls -A \| wc -l  
11

You can also use this command to achieve the same result:

```bash
ls -1A | wc -l
```

Note that it the option used is 1 (one) not l (L). Using the l (L) option displays an additional line at the beginning of the output (see ‘total 64’ in the directory output at the beginning of the article). Using 1 (one) lists one content per line excluding the additional line. This gives a more accurate result.

### Count number of files and directories including the subdirectories

What you have see so far is the count of files and directories in the current directory only. It doesn’t take into account the files in the [subdirectories](https://www.computerhope.com/jargon/s/subdirec.htm).

If you want to count the number of files and directories in all the subdirectories, you can use the tree command.

```bash
tree -a
```

This command shows the directory structure and then displays the summary at the bottom of the output.

abhishek@linuxhandbook:~/tutorials$ tree -a  
.  
├── agatha.txt  
├── .a.t  
├── bash_script.sh  
├── cpluplus.cpp  
├── my_zip_folder.zip  
├── newdir  
│ ├── new_dir  
│ │ ├── c.xyz  
│ │ ├── myzip1.zip  
│ │ └── myzip2.zip  
│ └── test_dir  
│ ├── c.xyz  
│ ├── myzip1.zip  
│ └── myzip2.zip  
├── prog.py  
├── services  
├── sherlock.txt  
├── sleep.sh  
└── target  
├── agatha.txt  
├── file1.txt  
└── past  
├── file1.txt  
├── file2.txt  
└── source1  
└── source2  
└── file1.txt  
7 directories, 19 files

As you can see in the output, it shows that there are 7 directories and 20 files in total. The good thing about this result is that it doesn’t count directories in the count of files.

### Count only the files, not directories

So far, all the solutions we have seen for counting the number of files, also take directories into account. Directories are essentially files but what if you want to count only the number of files, not directories? You can use the wonderful [find command](http://man7.org/linux/man-pages/man1/find.1.html).

You can run this command:

```bash
find . -type f | wc -l
```

The above command searched for all the files (type f) in current directory and its subdirectories.

abhishek@linuxhandbook:~/tutorials$ find . -type f \| wc -l  
20

### Count only the files, not directories and only in current directory, not subdirectories

That’s cool! But what if you want to count the number of files in the current directory only excluding the files in the subdirectories? You can use the same command as above but with a slight difference.

All you have to do is to add the ‘depth’ of your find. If you set it at 1, it won’t enter the subdirectories.

```bash
find . -maxdepth 1 -type f | wc -l
```

Here’s the output now:

abhishek@linuxhandbook:~/tutorials$ find . -maxdepth 1 -type f \| wc -l  
9

### Reference

* [https://linuxhandbook.com/count-files-directory-linux/](https://linuxhandbook.com/count-files-directory-linux/)


