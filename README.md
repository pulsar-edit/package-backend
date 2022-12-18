# Pulsar Backend / Atom Backend
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2a0877b7d4254cc098fb0da600056643)](https://www.codacy.com/gh/pulsar-edit/package-backend/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pulsar-edit/package-backend&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/confused-Techie/atom-backend/branch/main/graph/badge.svg?token=LZ33F9DSH4)](https://codecov.io/gh/confused-Techie/atom-backend)

[![CI - Standards](https://github.com/pulsar-edit/package-backend/actions/workflows/ci-standards.yml/badge.svg)](https://github.com/pulsar-edit/package-backend/actions/workflows/ci-standards.yml)
[![CI - Tests](https://github.com/pulsar-edit/package-backend/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/pulsar-edit/package-backend/actions/workflows/ci-tests.yml)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->


## Introduction

With the unfortunate [sunset of Atom](https://github.blog/2022-06-08-sunsetting-atom/) announcement, the community of its users couldn't allow the editor and its ecosystem to sunset with it. One major aspect of that ecosystem now lives here. The ability to search install and publish the huge repository of Packages all relied on the Backend Server that Atom had originally maintained, while the rest of the Atom project is open source and can easily be forked unfortunately the same isn't true of the Atom.io Package Repository Server.

What this means is that days after the initial announcement work began to reverse engineer how the backend functioned and behaved, resulting in the original [`confused-Techie/atom-backend`](https://github.com/confused-Techie/atom-backend), the origins of this project. But the goals of this new Backend are twofold.
Since the original creator of this repo is a part of [Pulsar](https://github.com/pulsar-edit), the emerging fork of Atom, the eventual goal for Atom Backend has always been to serve the needs of Pulsar, its editor and its community. But in the interest of providing the most value to the Open Source community the first (v1.0.0) release of Atom Backend will be, as closely as possible, a drop in replacement of the original Atom.io Backend. Meaning that any other forks of Atom that may emerge will be able to use this repository without issue, and without any changes other than changing the URL their editor reaches out to.

Even further the team that created this repo have also created the [tools](https://github.com/confused-Techie/AtomPackagesArchive) necessary to archive the entirety of Atom's [Atom.io](https://atom.io/packages) Package Repository. Every single package and version. This has allowed Pulsar to have a running start with a drop in replacement of a Backend Server that already contains every single package that was previously published, with of course some very few exceptions.

What all of this does implicitly mean, is the repo [`confused-Techie/atom-backend`](https://github.com/confused-Techie/atom-backend) will aim to only ever reach Feature Parity with Atom's Original Atom.io Backend Server, so that once it hits version 1.0.0 development will stop. The repo will forever aim to be an easily obtainable drop in replacement of the original Atom.io Server. But as for new features, new developments and improvements of the Backend Server will occur on Pulsar's [`pulsar-edit/package-backend`](https://github.com/pulsar-edit/package-backend) repository, as those changes will be intended for the Pulsar Editor, and may eventually result in incompatibility with Atom.

If you a user of Atom want to continue being able to install and search packages but don't want to manage your own backend infrastructure, you are able to change the URL your Atom instance points to, such as the backend in use for Pulsar. Be warned that eventually an improvement or change intended for Pulsar will break how it interacts with Atom. Unfortunately the team of Pulsar would be unable to maintain both a backend for Atom users and Pulsar users. But if someone else would like to maintain the infrastructure for Atom users, then this is the repository you need to do so.

## Summary / Links

Creating this code base and the interactions it has, has been a massive feat with extreme thanks going out to the contributors that assisted in creating this and getting us to a point of stability where we now have hundreds of requests every single day providing a great service to all users of Pulsar.

If you'd like to learn more about the Pulsar / Atom Backend or learn how to contribute then check out the links below:

* If you'd like to contribute, read the [docs](/docs/reference/index.md).
* To read about the original research and code that started the backend, visit [Atom Community Server Backend](https://github.com/confused-Techie/atom-community-server-backend) which was the original codebase of this project written in Golang. This was later switched to JavaScript to provide more broad support from contributors.
* To visit the source code of the [Pulsar Backend Package Repository](https://github.com/pulsar-edit/package-backend).
* To visit the source code of the [Atom Backend](https://github.com/confused-Techie/atom-backend).
* If you're package that was Published to Atom is/isn't available refer to our [docs](/docs/reference/packages.md) on what to do.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/confused-Techie"><img src="https://avatars.githubusercontent.com/u/26921489?v=4?s=100" width="100px;" alt="confused_techie"/><br /><sub><b>confused_techie</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=confused-Techie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Digitalone1"><img src="https://avatars.githubusercontent.com/u/25790525?v=4?s=100" width="100px;" alt="Giusy Digital"/><br /><sub><b>Giusy Digital</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=Digitalone1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DeeDeeG"><img src="https://avatars.githubusercontent.com/u/20157115?v=4?s=100" width="100px;" alt="DeeDeeG"/><br /><sub><b>DeeDeeG</b></sub></a><br /><a href="#ideas-DeeDeeG" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ndr-brt"><img src="https://avatars.githubusercontent.com/u/8570990?v=4?s=100" width="100px;" alt="ndr_brt"/><br /><sub><b>ndr_brt</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=ndr-brt" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Daeraxa"><img src="https://avatars.githubusercontent.com/u/58074586?v=4?s=100" width="100px;" alt="Daeraxa"/><br /><sub><b>Daeraxa</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=Daeraxa" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
