---
title: "How to Copy Local Files to S3 with AWS CLI"
date: "2021-03-06T14:36:44+00:00"
description: "This article will summarize the steps required in order to use the AWS CLI to backup local files opposed to using a web browser. This is particularly useful for large files and will significantly reduce overhead. The web browser will often fail when moving tens or hundreds of GB, so using the CLI is a much more efficient way of copying data to S3."
topics:
  - aws
  - s3
ail: 0
---
This article will summarize the steps required in order to use the AWS CLI to backup local files opposed to using a web browser. This is particularly useful for large files and will significantly reduce overhead. The web browser will often fail when moving tens or hundreds of GB, so using the CLI is a much more efficient way of copying data to S3.

### Install AWS CLI Tool

```shell
curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
unzip awscli-bundle.zip
sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws
```

![aws-cli.png](https://cdn.levine.io/uploads/images/gallery/2020-08/scaled-1680-/wXJcVWO25NOgJ8Uk-aws-cli.png)

Try to run `aws` after installation. If you see output as follows, you should have installed it successfully.

```shell
$ aws
usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]
To see help text, you can run:

  aws help
  aws <command> help
  aws <command> <subcommand> help
aws: error: too few arguments
```

### Configuring the AWS CLI tool

The quickest way to configure the AWS CLI is to run the `aws configure` command:

```shell
$ aws configure
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [us-easy-1]: us-easy-1
Default output format [None]: json
```

The `AWS Access Key ID` and `AWS Secret Access Key` can be found in [Your Security Credentials] on the AWS Console.

[Your Security Credentials]: https://console.aws.amazon.com/iam/home#security_credential

### Copying Local Files to S3

The syntax for copying files to/from S3 in AWS CLI is:  
`aws s3 cp <source> <destination>`

The “source” and “destination” arguments can either be local paths or S3 locations. The three possible variations of this are:  
`aws s3 cp <Local Path> <S3 URI>
aws s3 cp <S3 URI> <Local Path>
aws s3 cp <S3 URI> <S3 URI>`

To copy all the files in a directory (local or S3) you must use the `--recursive` option.

The following are a few examples of copying local files to S3:

```bash
#!/bin/bash

#copy my-file.txt to the to the "data" directory located in my-s3-bucket 
aws s3 cp my-file.txt s3://my-s3-bucket/data/

#copy all files in my-data-dir into the "data" directory located in my-s3-bucket 
aws s3 cp my-data-dir/ s3://my-s3-bucket/data/ --recursive
```

### Resources

* [https://www.systutorials.com/uploading-large-files-amazon-s3-aws-cli/](https://www.systutorials.com/uploading-large-files-amazon-s3-aws-cli/)
* [https://bigdatums.net/2016/09/17/copy-local-files-to-s3-aws-cli/](https://bigdatums.net/2016/09/17/copy-local-files-to-s3-aws-cli/)


