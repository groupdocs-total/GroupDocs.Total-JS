# GroupDocs.Total.JS UI Example
###### version 0.4.24


## Description
Simple, elegant and modern UI engine re-written in JavaScript from scratch which can be easily integrated into any platform such as Java, .NET, etc.
Simple and flexible configuration makes integration process quite easy and intuitive.

**Note** GroupDocs.Total.JS can't run on it's own, so if you want to see it in action check our out-of-the-box .NET or Java examples below.


## Examples
- [GroupDocs.Total for Java Dropwizard Example](https://github.com/groupdocs-total/GroupDocs.Total-for-Java-Dropwizard)
- [GroupDocs.Total for .NET MVC Example](https://github.com/groupdocs-total/GroupDocs.Total-for-NET-MVC)
- [GroupDocs.Total for .NET Web Forms Example](https://github.com/groupdocs-total/GroupDocs.Total-for-NET-WebForms)

## Development guide

Currently, front-end application consists of following components:

* Common
* Viewer
* Annotation
* Comparison
* Signature
* Total

### Packages

Publishing packages managed by [lerna.js](https://lernajs.io/). Lerna allows publishing of multiple packages that live in the same repository.

These components organized in a single git repository. Each component can be added as the dependency using NPM. All these components are published under `groupdocs.examples.jquery` organization.

```shell
npm i @groupdocs.examples.jquery/viewer
```
```shell
npm i @groupdocs.examples.jquery/annotation
```
```shell
npm i @groupdocs.examples.jquery/signature
```
```shell
npm i @groupdocs.examples.jquery/comparison
```
```shell
npm i @groupdocs.examples.jquery/total
```
```shell
npm i @groupdocs.examples.jquery/common
```

In order to publish above-mentioned packages, one must use Lerna command.

```shell
lerna publish
```

This command will create tags, build packages and publish them on NPM.

### Development workflow

The simplest way to start development is to clone the repository and execute following commands in the root of the project:

```shell
npm install
```
This command will resolve all JS dependencies

```shell
npm start
```
This command will start a local server at `localhost:3000` and serve files from project's root directory. Also will provide additional benefits like [browser sync](https://browsersync.io/) and in future asset compilation.



### Browser sync

This gulp plugin starts a local server and exposes two useful endpoints :

```shell
 
       Local: http://localhost:3000
    External: http://192.168.1.2:3000
 
          UI: http://localhost:3001
 UI External: http://localhost:3001
 
```


* Local: typically this is your localhost
* External: will be IP within your private network that can be accessed by your mobile phone or other device connected to the same network

Browser sync will synchronize all activities performed on a webpage in all connected devices. It also will output QR code so you can access External URL without typing it manually.