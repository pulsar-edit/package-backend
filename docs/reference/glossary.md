# Glossary

This document provides definitions of words and terms used within this projects source code and documentation that cannot be easily found elsewhere.

* **Atom Package Registry (APR)**: The backend Package Reigstry server that was built, maintained, and sunet by Atom/GitHub/Microsoft. Pulsar cannot access this server, or it's code base in any way. Pulsar has only been able to learn about it through interactions with it, and the interactions that are baked into the source code of tools that rely on the APR. In some places, within the source code/documentation, you may find alternative names used to refer to the APR eg. Original Atom Server, Atom.io Server, Atom's Backend.

* **Pulsar Package Registry (PPR)**: This repository hosts the code of the PPR. The PPR refers to the Pulsar backend server that hosts and responds to any package requests, allowing users to publish, and install community packages. The PPR is the Pulsar based, open-source, recreation of the APR.

* **Pulsar Package**: Refers to any community package that is published to the PPR.

* **Server Status Object**: Refers to the structure of objects that is generally passed between modules within this code base. Allowing modules to easily communicate success or failure in a standardized method, while easily supporting the Early Return Strategy. Additional details on a [Server Status Object]().

* **Package Object Full**: Refers to the largest format of a package's data that is returned to end users within the PPR. Containing the full range of information stored about a single package, such as it's base information, as well as details of every single version of that package. Additional details on a [Package Object Full]().

* **Package Object Short**: Refers to the most common format of a package's data that is returned to end users within the PPR. Containing a subset of that package's information, such as it's base details and the details of the most recent version publish. Additional details on a [Package Object Short]().

* **Package Object Mini**: Refers to the smallest possible format of a package's data that is returned to end users within the PPR. Containing generally the base package information and a single version information. Additional details on a [Package Object Mini]().

* **User Object**: Refers to the format of data that is returned about users specifically. Additional details on [User Object]()s.

* **Bubbled Errors**: Refers to the behavior used, that allows errors to bubble up from lower level modules to the HTTP Handling layer, to ensure the end user always sees exactly how and why something has failed. Additional details on [Bubbled Errors]().
