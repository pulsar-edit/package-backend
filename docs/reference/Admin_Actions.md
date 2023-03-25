# Admin Actions

When you consider that most backend services are a black box of code and decision making, the Pulsar Backend aims to change this. Aims to be as open and transparent as possible.

With that said this document will serve as the ongoing history of administrative actions that must be taken against the backend.

## 2023 - March 25

For a period of time there was a bug on the backend that, when a package author would publish a new version of their package, the package's main `data` field would be saved improperly. Resulting in the package becoming corrupt and un-downloadable. Some package authors were effected by this.

One of which was the package author @manngo. Who helpfully pointed out that their package was corrupt on a [GitHub Issue](https://github.com/pulsar-edit/package-backend/issues/125).

So their package was manually modified on the database to fix this corruption:

* [`web-developer-tools`](https://github.com/manngo/atom-web-tools/tree/master)
  - Removed version `0.4.4` from the backend.
  - Reset version `0.4.0` as the `latest`.
  - Fixed the packages `data` field to be valid, and contain the data needed.

## 2023 - March 24

For the uninitiated, during the last month or so of the old Atom Package Registry days there was significant amounts of spam packages being generated.

After the initial migration of packages from Atom we had to sift through everything to remove any of this spam we could find.

Some of the common factors:
* The package included nothing beyond template or `package-generator` files.
* The package advertised online gambling.
* The package's major language was always Indonesian.

Considering the above commonalities of the hundreds of spam packages Atom saw in the last days we continue to remain vigilant to these appearing within our database, and remove it once found. And in that effort:

We removed the following packages due to suspected spam:

* [`slot-depo-pulsa`](https://github.com/Star-Grey/slot-depo-pulsa)
* [`togel-sdy`](https://github.com/Star-Grey/togel-sdy)

## 2023 - March 18

Removed some community packages during our effort to ensure we only keep packages with licenses that allow for redistribution. The packages listed below either had licenses that outright prohibited redistribution or were otherwise unclear, and after a thourough attempt to contact the publishers we had resolved to remove the packages.

* [`bemhtml`](https://github.com/jchouse/bemhtml)
* [`github-user-datatip`](https://github.com/jgebhardt/atom-github-user-datatip)
* [`atom-arma-language`](https://github.com/DevZupa/Atom-Arma-Language)
* [`go-hyperclick`](https://github.com/zheng1/go-hyperclick)
* [`language-dm`](https://github.com/stuicey/language-dm)
* [`egg`](https://github.com/chow-xiang/atom-egg)
* [`next-dark`](https://github.com/casesandberg/next-dark-ui)
* [`language-multiverse`](https://github.com/drewctaylor/language-multiverse)
* [`autoclose-editors`](https://github.com/pvienneau/atom-clear-deleted-editors)
* [`scheme-syntax`](https://github.com/rogerbutt/scheme-syntax)
* [`atom-itunes`](https://github.com/OskarPersson/atom-itunes)
* [`woah-there-mousewheel`](https://github.com/rzhw/woah-there-mousewheel)
* [`orgfld`](https://github.com/ukdor/orgfld)
* [`language-bgscript`](https://github.com/gwillz/language-bgscript)
* [`quilt-completions`](https://github.com/lemonmade/quilt-completions)
* [`next-dark-ui`](https://github.com/casesandberg/next-dark-ui)
* [`atom-selenium-autocomplete`](https://github.com/ibhubs/atom-selenium-autocomplete)
* [`atom-monokai-one-dark`](https://github.com/AntonioDeCasper/atom-monokai-one-dark)
* [`linter-flexible-survival`](https://github.com/HelicalLove/linter-flexible-survival)
* [`single-ut`](https://github.com/lawrencebla/single-ut-atom)
* [`language-tree-test`](https://github.com/Aerijo/language-tree-test)
* [`punchclock`](https://github.com/queenp/punchclock)
* [`multiverse-syntax`](https://github.com/drewctaylor/multiverse-syntax)
* [`mura-snippets`](https://github.com/rwatts3/atom-mura-snippets)
* [`haskell-tools`](https://github.com/nboldi/haskell-tools-atom)
* [`language-todotxt-plus`](https://github.com/LerBigDev/language-todotxt-plus)
* [`autocomplete-webgl`](https://github.com/hughsk/autocomplete-webgl)
* [`emp-frontend-devtool`](https://github.com/RYTong/emp-frontend-devtool)
* [`language-t8-assembly`](https://github.com/pjht/language-t8-assembly)
* [`language-topas`](https://github.com/joostverburg/language-topas)
* [`itunes`](https://github.com/reduxd/atom-itunes)
* [`execute-command`](https://github.com/retroverse/execute-command)
* [`language-antimony`](https://github.com/0u812/language-antimony)
* [`smilebin`](https://github.com/tdenovan/smilebin-atom-package)
* [`sandstorm-syntax`](https://github.com/bardleware/sandstorm-atom-syntax)
* [`swinsian`](https://github.com/tgrrtt/atom-swinsian)
* [`language-maxlang`](https://github.com/bascouch/language-maxlang)
* [`export-project-html`](https://github.com/emendir/Export-Project-to-HTML---Atom-Plugin)
* [`language-sqf`](https://github.com/mgoodings/language-sqf)
* [`goproof`](https://github.com/mitchr/goproof)
* [`find-dependencies`](https://github.com/nikitabulatov/find-dependencies)
* [`aural-coding`](https://github.com/probablycorey/aural-coding)
* [`neolao`](https://github.com/neolao/atom-package-neolao)
* [`insert-require`](https://github.com/vjeux/insert-require)
* [`mdfld`](https://github.com/quackingduck/mdfld)
* [`language-alt-pfm`](https://github.com/andraus/language-alt-pfm)
* [`atomkit`](https://github.com/almonk/atomkit)
* [`sandstorm-ui`](https://github.com/bardleware/sandstorm-atom-ui)
* [`snippr-io-editors-atom`](https://github.com/snippr-io/snippr-io-editors-atom)
* [`atom-grok-highlighter`](https://github.com/nickStefanko/atom-grok-highlighter)
* [`atom-expressionengine`](https://github.com/mindpixel-labs/atom-expressionengine)
* [`cga-4bit-syntax`](https://github.com/DutChen18/cga-4bit)
* [`darker-one-dark-syntax`](https://github.com/SenTisso/darker-one-dark-syntax)
* [`language-cwl-atom`](https://github.com/SolomonShorser-OICR/language-cwl-atom)
* [`language-structured-text`](https://github.com/E-Renshaw/language-structured-text)
* [`atom-nonmem`](https://github.com/dpastoor/atom-nonmem)
* [`hello-world`](https://github.com/distalx/hello-world-atom)
* [`language-fhem`](https://github.com/Fankserver/atom-language-fhem)
* [`cwl-solarized-dark`](https://github.com/SolomonShorser-OICR/cwl-solarized-dark)
* [`thedaniel-test-package-2`](https://github.com/thedaniel/test-package-2)
* [`kobble`](https://github.com/kobble-git/kobble-package)
* [`atom-video-game-name-generator`](https://github.com/lewismoten/atom-video-game-name-generator)
* [`irene-emojify`](https://github.com/prymnumber/emojify)
* [`devfactory-language-client`](https://github.com/mizzlr/Atom-Language-Client)
* [`language-category-compiler`](https://github.com/jack-willturner/language-category-compiler)
* [`language-gpp`](https://github.com/Milys/language-gpp)
* [`language-tesp`](https://github.com/aleixpinardell/language-tesp)
* [`continuum-atom`](https://github.com/dualmoon/continuum-atom)
* [`cut-line`](https://github.com/tekkub/cut-line)
* [`nitrogen`](https://github.com/petejkim/nitrogen-dist)
* [`luser-interface-ui`](https://github.com/elifoster/luser-interface)
* [`made-of-code-atom`](https://github.com/mkdynamic/made-of-code-atom)
* [`keystrokes`](https://github.com/lilyszhang/keystrokes)
* [`seti-super-compact-ui`](https://github.com/mdonnalley/seti-super-compact-ui)
* [`language-jsil`](https://github.com/tompntn/language-jsil)
* [`language-ivan`](https://github.com/perficientautomation/atom-language-ivan)
* [`monokai-soft`](https://github.com/nikteg/atom-monokai-soft)
* [`foldingtext-for-atom`](https://github.com/jessegrosjean/foldingtext-for-atom)

## 2023 - March 17

Removed some community packages during our effort to ensure we only keep packages with Licenses that allow for redistribution. The packages listed below either had licenses that outright prohibited redistribution or were otherwise unclear, and after a thourough attempt to contact the publishers we had resolved to remove the packages.

* [`mstest2`](https://github.com/mstest1/mstest2)
* [`latex-online`](https://github.com/Spijkervet/atom-latex-online)
* [`language-wex5`](https://github.com/ranforce/language-wex5)
* [`hotdog-tabs`](https://github.com/kmh11/hotdog-tabs)

## 2023 - March 10

The community package `simplified-russian-menu` was reported by a user of Pulsar as being uninstallable.

The repository it was linked to had been deleted or made private on GitHub.
As well as using Web Archive it was discovered the user had changed their account name, and had removed the package entirely from their account.

After confirming this behavior wasn't because of a technical error the package was removed from the Pulsar Package Registry.

- `LexBacker/simplified-russian-menu:cffefb9f-e11a-4447-9f79-ce93a62f35c9`

## 2022 - December 14

### Blocked Access to a specific Set of IP Addresses

After it came to our attention that a specific user was hammering our servers on a specific couple of endpoints we had to block their access to the backend.

This user had requested the two endpoints over 6,000 times over 4 days. This behavior had not been observed by any other users, and considering the server hosting costs are handled entirely by the Pulsar Team and community donations, this simply wasn't an expense that could be afforded.

Considering this their access was completely cut off from the backend, to prevent this abuse of our systems.

## 2022 - December 9

Modified some packages data on the backend database, due to incompatibility with the new database constraints.

- `totaljs/atom-syntax` - Removed `v0.1.2`
- `pkrll/doc-green-syntax` - Removed `1.0`
- `Cronos87/atom-laravel` - Removed `0.1`
- `ReeSilva/atom-homestead` - Removed `v0.10.0`
- `kraih/atom-perltidy` - Removed `0.1`, `0.2`, `0.3`
- `swdotcom/swdc-atom` - Removed Package
