# Admin Actions

When you consider that most backend services are a black box of code and decision making, the Pulsar Backend aims to change this. Aims to be as open and transparent as possible.

With that said this document will serve as the ongoing history of administrative actions that must be taken against the backend.

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
