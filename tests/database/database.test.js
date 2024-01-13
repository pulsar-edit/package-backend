// This file has been moved directly from the old testing method.
// Likely should be updated at one point

// This is our secondary integration test.
// Due to the difficulty in testing some aspects as full integration tests,
// namely tests for publishing and updating packages (due to the varried responses expected by github)
// We will use this to tests these aspects directly against the DB. Being able
// to provide whatever values we wish to these functions. Just to ensure that everything works as expected.
// Or at the very least that if there is a failure within these, it will not result in
// bad data being entered into the database in production.

let database = require("../../src/database.js");
let utils = require("../../src/utils.js");

afterAll(async () => {
  await database.shutdownSQL();
});

describe("insertNewPackage", () => {
  test("Should return Success with Valid Data - 1 Version", async () => {
    const pack = require("./fixtures/git.createPackage_returns/valid_one_version.js");
    const obj = await database.insertNewPackage(pack);
    if (!obj.ok) console.log(obj);
    expect(obj.ok).toBeTruthy();
    expect(typeof obj.content === "string").toBeTruthy();
    // This endpoint only returns the pointer on success.
  });
  test("Should return success with valid data - Multi Version", async () => {
    const pack = require("./fixtures/git.createPackage_returns/valid_multi_version.js");
    const obj = await database.insertNewPackage(pack);
    if (!obj.ok) console.log(obj);
    expect(obj.ok).toBeTruthy();
    expect(typeof obj.content === "string").toBeTruthy();
    // this endpoint only returns a pointer on success
  });
});

describe("insertNewPackageName", () => {
  test("Should return Not Found for package that doesn't exist", async () => {
    const obj = await database.insertNewPackageName(
      "notARepo",
      "notARepo-Reborn"
    );
    expect(obj.ok).toBeFalsy();
    expect(obj.short).toEqual("not_found");
  });
  test("Should return Success for valid package", async () => {
    const obj = await database.insertNewPackageName(
      "publish-test-valid-rename",
      "publish-test-valid"
    );
    expect(obj.ok).toBeTruthy();
    expect(obj.content).toEqual(
      "Successfully inserted publish-test-valid-rename."
    );
  });
});

describe("getPackageByName", () => {
  test("Should return Server Error for Package that doesn't exist", async () => {
    const obj = await database.getPackageByName("language-golang");
    expect(obj.ok).toBeFalsy();
    expect(obj.short).toEqual("not_found");
  });
  test("Should return Server Error for Package that doesn't exist, even with User", async () => {
    const obj = await database.getPackageByName("language-golang", true);
    expect(obj.ok).toBeFalsy();
    expect(obj.short).toEqual("not_found");
  });
});

describe("Get Sorted Packages", () => {
  test("Should return good pagination when there are no results", async () => {
    const obj = await database.getSortedPackages({
      page: 1,
      sort: "relevance",
      service: "consumed",
      serviceType: "does-not-exist",
      direction: "desc",
    });
    expect(obj.ok).toBeTruthy();
    expect(Array.isArray(obj.content)).toBeTruthy();
    expect(obj.content.length).toBe(0);
    expect(obj.pagination.count).toBe(0);
    expect(obj.pagination.page).toBe(0);
    expect(obj.pagination.total).toBe(0);
  });
});

describe("Get Package Search", () => {
  test("Should return good pagination when there are no results", async () => {
    const obj = await database.simpleSearch(
      "will-never-match-a-search",
      1,
      "desc",
      "relevance"
    );
    expect(obj.ok).toBeTruthy();
    expect(Array.isArray(obj.content)).toBeTruthy();
    expect(obj.content.length).toBe(0);
    expect(obj.pagination.count).toBe(0);
    expect(obj.pagination.page).toBe(0);
    expect(obj.pagination.total).toBe(0);
  });
});

describe("Package Lifecycle Tests", () => {
  // Below are what we will call lifecycle tests.
  // That is tests that will test multiple actions against the same package,
  // to ensure that the lifecycle of a package will be healthy.
  test("Package A Lifecycle", async () => {
    const pack = require("./fixtures/lifetime/package-a.js");

    // === Is the package name available?
    const nameIsAvailable = await database.packageNameAvailability(
      pack.createPack.name
    );
    expect(nameIsAvailable.ok).toBeTruthy();

    // === Let's publish our package
    const publish = await database.insertNewPackage(pack.createPack);
    expect(publish.ok).toBeTruthy();
    expect(typeof publish.content === "string").toBeTruthy();
    // this endpoint only returns a pointer on success.

    // === Do we get all the right data back when asking for our package?
    const getAfterPublish = await database.getPackageByName(
      pack.createPack.name
    );
    expect(getAfterPublish.ok).toBeTruthy();
    // then let's check some essential values
    expect(typeof getAfterPublish.content.pointer === "string").toBeTruthy();
    expect(getAfterPublish.content.name).toEqual(pack.createPack.name);
    expect(getAfterPublish.content.created).toBeDefined();
    expect(getAfterPublish.content.updated).toBeDefined();
    expect(getAfterPublish.content.creation_method).toEqual(
      pack.createPack.creation_method
    );
    expect(getAfterPublish.content.downloads).toEqual("0");
    // Original stargazers already added to stargazers count
    expect(getAfterPublish.content.stargazers_count).toEqual("0");
    expect(getAfterPublish.content.versions.length).toEqual(1); // Only 1 ver was provided
    expect(getAfterPublish.content.versions[0].semver).toEqual(
      pack.createPack.metadata.version
    );
    expect(getAfterPublish.content.versions[0].license).toEqual("NONE");
    expect(getAfterPublish.content.versions[0].package).toBeDefined();

    // === Can we publish a duplicate package?
    const dupPublish = await database.insertNewPackage(pack.createPack);
    expect(dupPublish.ok).toBeFalsy();

    // === Let's rename our package
    const NEW_NAME = `${pack.createPack.name}-rename`;
    const newName = await database.insertNewPackageName(
      NEW_NAME,
      pack.createPack.name
    );
    expect(newName.ok).toBeTruthy();
    expect(newName.content).toEqual(`Successfully inserted ${NEW_NAME}.`);

    // === Can we get the package by it's new name?
    const getByNewName = await database.getPackageByName(NEW_NAME);
    expect(getByNewName.ok).toBeTruthy();
    expect(getByNewName.content.name).toEqual(NEW_NAME);
    expect(getByNewName.content.created).toBeDefined();
    expect(
      getByNewName.content.updated >= getAfterPublish.content.updated
    ).toBeTruthy();
    // For the above expect().toBeGreaterThan() doesn't support dates.

    // === Can we still get the package by it's old name?
    const getByOldName = await database.getPackageByName(pack.createPack.name);
    expect(getByOldName.ok).toBeTruthy();
    expect(getByOldName.content.name).toEqual(NEW_NAME);
    expect(getByOldName.content.created).toBeDefined();
    expect(
      getByOldName.content.updated >= getAfterPublish.content.updated
    ).toBeTruthy();

    // === Can we rename with an already used name?
    // This should fail because there's a unique constraint on names, not only
    // for the single package, but the entire table, i.e. two packages cannot
    // have the same name.
    const renameToExistingName = await database.insertNewPackageName(
      pack.createPack.name,
      NEW_NAME
    );
    expect(renameToExistingName.ok).toBeFalsy();
    expect(renameToExistingName.content).toEqual(
      `Unable to add the new name: ${pack.createPack.name} is already used.`
    );

    // === Can we get the package collection specifying the old name?
    const packCollection = await database.getPackageCollectionByName([
      pack.createPack.name,
    ]);
    expect(packCollection.ok).toBeTruthy();
    expect(Array.isArray(packCollection.content)).toBeTruthy();
    for (const p of packCollection.content) {
      expect(typeof p.data.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.semver === "string").toBeTruthy();
    }

    // === Now let's try to delete the only version available.
    // This should fail because the package needs to have at least
    // one published (latest) version.
    const removeOnlyVersion = await database.removePackageVersion(
      NEW_NAME,
      pack.createPack.metadata.version
    );
    expect(removeOnlyVersion.ok).toBeFalsy();
    expect(removeOnlyVersion.content).toEqual(
      `${NEW_NAME} package has less than 2 published versions: deletion not allowed.`
    );

    // === Now let's add a version
    const v1_0_1 = pack.addVersion("1.0.1");
    const addNextVersion = await database.insertNewPackageVersion(
      pack.packageDataForVersion(v1_0_1)
    );
    if (!addNextVersion.ok) {
      console.log(addNextVersion);
    }
    expect(addNextVersion.ok).toBeTruthy();
    expect(addNextVersion.content).toEqual(
      `Successfully added new version: ${v1_0_1.name}@${v1_0_1.version}`
    );

    // === Let's see if this new version is the latest
    // The versions are sorted from latest to oldest, so
    // index 0 is the latest, index 1 is the older.
    const getAfterVer = await database.getPackageByName(NEW_NAME);
    expect(getAfterVer.ok).toBeTruthy();
    expect(getAfterVer.content.versions.length).toEqual(2);
    expect(getAfterVer.content.versions[0].semver).toEqual(v1_0_1.version);
    expect(getAfterVer.content.versions[0].license).toEqual(v1_0_1.license);
    expect(getAfterVer.content.versions[0].meta.name).toEqual(v1_0_1.name);
    expect(getAfterVer.content.versions[0].meta.version).toEqual(
      v1_0_1.version
    );
    expect(getAfterVer.content.versions[1].semver).toEqual(
      pack.createPack.metadata.version
    );

    // === Can we publish a duplicate or a lower version?
    const dupVer = await database.insertNewPackageVersion(
      pack.packageDataForVersion(v1_0_1)
    );
    expect(dupVer.ok).toBeFalsy();
    expect(dupVer.content).toEqual(
      `Not allowed to publish a version already present for ${pack.createPack.name}`
    );

    // === Can we get this specific version with the new name
    const getNewVerOnly = await database.getPackageVersionByNameAndVersion(
      NEW_NAME,
      v1_0_1.version
    );
    expect(getNewVerOnly.ok).toBeTruthy();
    expect(getNewVerOnly.content.semver).toEqual(v1_0_1.version);
    expect(getNewVerOnly.content.meta.name).toEqual(pack.createPack.name);

    // === Can we get the first version published still?
    const getOldVerOnly = await database.getPackageVersionByNameAndVersion(
      NEW_NAME,
      pack.createPack.metadata.version
    );
    expect(getOldVerOnly.ok).toBeTruthy();
    expect(getOldVerOnly.content.semver).toEqual(
      pack.createPack.metadata.version
    );
    expect(getOldVerOnly.content.meta.name).toEqual(pack.createPack.name);

    // === Can we add a download to our package?
    const downPack = await database.updatePackageIncrementDownloadByName(
      NEW_NAME
    );
    expect(downPack.ok).toBeTruthy();
    expect(downPack.content.name).toEqual(NEW_NAME);
    expect(downPack.content.downloads).toEqual("1");

    // === Can we undownload our package?
    const downPackUndo = await database.updatePackageDecrementDownloadByName(
      NEW_NAME
    );
    expect(downPackUndo.ok).toBeTruthy();
    expect(downPackUndo.content.name).toEqual(NEW_NAME);
    expect(downPackUndo.content.downloads).toEqual("0");

    // === Can we get the download count od our package below zero?
    const downPackReUndo = await database.updatePackageDecrementDownloadByName(
      NEW_NAME
    );
    expect(downPackReUndo.ok).toBeTruthy();
    expect(downPackReUndo.content.name).toEqual(NEW_NAME);
    expect(downPackReUndo.content.downloads).toEqual("0");

    // === Can we download by old name?
    const downPackOld = await database.updatePackageIncrementDownloadByName(
      pack.createPack.name
    );
    expect(downPackOld.ok).toBeTruthy();
    expect(downPackOld.content.name).toEqual(NEW_NAME);
    expect(downPackOld.content.downloads).toEqual("1");

    // === Can we remove a non-existing version?
    const noPubVer = "3.3.3";
    const removeNonExistingVersion = await database.removePackageVersion(
      NEW_NAME,
      noPubVer
    );
    expect(removeNonExistingVersion.ok).toBeFalsy();
    expect(removeNonExistingVersion.content).toEqual(
      `Unable to remove ${noPubVer} version of ${NEW_NAME} package.`
    );

    // === Can we delete our newest version?
    // === Here we append an extension to test if the version is selected in the same way.
    const delLatestVer = await database.removePackageVersion(
      NEW_NAME,
      v1_0_1.version
    );
    expect(delLatestVer.ok).toBeTruthy();
    expect(delLatestVer.content).toEqual(
      `Successfully removed ${v1_0_1.version} version of ${NEW_NAME} package.`
    );

    // === Is our old version the latest again?
    const newLatestVer = await database.getPackageByName(NEW_NAME);
    expect(newLatestVer.ok).toBeTruthy();
    expect(newLatestVer.content.name).toEqual(NEW_NAME);
    expect(newLatestVer.content.versions.length).toEqual(1);
    expect(newLatestVer.content.versions[0].semver).toEqual(
      pack.createPack.metadata.version
    );

    // === Can we reinsert a previous deleted version?
    // This is intentionally unsupported because we want a new package to be always
    // higher than the previous latest one in order to trigger an update to the user.
    const reAddNextVersion = await database.insertNewPackageVersion(
      pack.packageDataForVersion(v1_0_1)
    );
    const latestVer = await database.getPackageByName(NEW_NAME);
    expect(reAddNextVersion.ok).toBeFalsy();
    expect(reAddNextVersion.content).toEqual(
      `Not allowed to publish a version already present for ${v1_0_1.name}`
    );

    // === Can we delete a version lower than the current latest?
    // First let's push a new version.
    const newSemver = "1.1.0";
    const newVersion = pack.addVersion(newSemver);
    const addNewVersion = await database.insertNewPackageVersion(
      pack.packageDataForVersion(newVersion)
    );
    expect(addNewVersion.ok).toBeTruthy();
    expect(addNewVersion.content).toEqual(
      `Successfully added new version: ${newVersion.name}@${newVersion.version}`
    );
    // Delete the oldest version.
    const removeOldestVersion = await database.removePackageVersion(
      NEW_NAME,
      pack.createPack.metadata.version
    );
    expect(removeOldestVersion.ok).toBeTruthy();
    expect(removeOldestVersion.content).toEqual(
      `Successfully removed ${pack.createPack.metadata.version} version of ${NEW_NAME} package.`
    );

    // === Can we add an odd yet valid semver?
    const oddVer = pack.addVersion("1.2.3-beta.0");
    const oddNewVer = await database.insertNewPackageVersion(
      pack.packageDataForVersion(oddVer)
    );
    expect(oddNewVer.ok).toBeTruthy();
    expect(oddNewVer.content).toEqual(
      `Successfully added new version: ${oddVer.name}@${oddVer.version}`
    );

    // === What about another Odd yet valid semver?
    const oddVer2 = pack.addVersion("1.2.4-alpha1");
    const oddNewVer2 = await database.insertNewPackageVersion(
      pack.packageDataForVersion(oddVer2)
    );
    expect(oddNewVer2.ok).toBeTruthy();
    expect(oddNewVer2.content).toEqual(
      `Successfully added new version: ${oddVer2.name}@${oddVer2.version}`
    );

    // === Can we delete the entire package?
    const delPack = await database.removePackageByName(NEW_NAME);
    expect(delPack.ok).toBeTruthy();
    expect(delPack.content).toEqual(
      `Successfully Deleted Package: ${NEW_NAME}`
    );

    // === Can we get our now deleted package?
    const ghostPack = await database.getPackageByName(NEW_NAME);
    expect(ghostPack.ok).toBeFalsy();
    expect(ghostPack.short).toEqual("not_found");

    // === Is the name of the deleted package available?
    const deletedNameAvailable = await database.packageNameAvailability(
      pack.createPack.name
    );
    expect(deletedNameAvailable.ok).toBeFalsy();
  });
  test("User A Lifecycle Test", async () => {
    const user = require("./fixtures/lifetime/user-a.js");

    // === Can we get our Non-Existant User?
    const noExistUser = await database.getUserByNodeID(user.userObj.node_id);
    expect(noExistUser.ok).toBeFalsy();
    expect(noExistUser.short).toEqual("not_found");

    // === Can we create our User?
    const createUser = await database.insertNewUser(
      user.userObj.username,
      user.userObj.node_id,
      user.userObj.avatar
    );
    expect(createUser.ok).toBeTruthy();
    expect(createUser.content.username).toEqual(user.userObj.username);
    expect(createUser.content.node_id).toEqual(user.userObj.node_id);
    expect(createUser.content.avatar).toEqual(user.userObj.avatar);

    // === Can we get our user that now exists?
    const getUser = await database.getUserByNodeID(user.userObj.node_id);
    expect(getUser.ok).toBeTruthy();
    expect(getUser.content.username).toEqual(user.userObj.username);
    expect(getUser.content.node_id).toEqual(user.userObj.node_id);
    expect(getUser.content.avatar).toEqual(user.userObj.avatar);
    expect(getUser.content.created_at).toBeDefined();
    expect(getUser.content.data).toBeDefined();
    expect(getUser.content.id).toBeDefined();

    // === Can we get our user by name?
    const getUserName = await database.getUserByName(user.userObj.username);
    expect(getUserName.ok).toBeTruthy();
    expect(getUserName.content.username).toEqual(user.userObj.username);
    expect(getUserName.content.node_id).toEqual(user.userObj.node_id);
    expect(getUserName.content.avatar).toEqual(user.userObj.avatar);
    expect(getUserName.content.created_at).toBeDefined();
    expect(getUserName.content.data).toBeDefined();
    expect(getUserName.content.id).toBeDefined();

    const USER_ID = getUserName.content.id;

    // === Can we get our user by Id?
    const getUserID = await database.getUserByID(USER_ID);
    expect(getUserID.ok).toBeTruthy();
    expect(getUserID.content.username).toEqual(user.userObj.username);
    expect(getUserID.content.node_id).toEqual(user.userObj.node_id);
    expect(getUserID.content.avatar).toEqual(user.userObj.avatar);
    expect(getUserID.content.created_at).toBeDefined();
    expect(getUserID.content.data).toBeDefined();
    expect(getUserID.content.id).toBeDefined();

    // === Can we get our user in a collection?
    const getUserIDCol = await database.getUserCollectionById([USER_ID]);
    expect(getUserIDCol.ok).toBeTruthy();
    expect(getUserIDCol.content.length).toEqual(1);
    expect(getUserIDCol.content[0].login).toEqual(user.userObj.username);

    // === Does our user have any fake stars?
    const getFakeStars = await database.getStarredPointersByUserID(USER_ID);
    expect(getFakeStars.ok).toBeTruthy();
    expect(getFakeStars.content.length).toEqual(0);

    // === Can we star a package with our User?
    // (After of course first creating the package to star)
    await database.insertNewPackage({
      name: "language-css",
      repository: {
        url: "https://github.com/confused-Techie/package-backend",
        type: "git",
      },
      owner: "confused-Techie",
      creation_method: "Test Package",
      releases: { latest: "1.0.0" },
      readme: "This is a readme!",
      metadata: { name: "language-css" },
      versions: {
        "1.0.0": {
          dist: { tarball: "download-url", sha: "1234" },
          name: "language-css",
        },
      },
    });
    const starPack = await database.updateIncrementStar(
      getUserID.content,
      "language-css"
    );

    expect(starPack.ok).toBeTruthy();
    expect(starPack.content).toEqual("Package Successfully Starred");

    // === Can we add a new star to the same package with our User?
    const reStarPack = await database.updateIncrementStar(
      getUserID.content,
      "language-css"
    );
    expect(reStarPack.ok).toBeTruthy();
    expect(reStarPack.content).toEqual("Package Already Starred");

    // === Does our user now have valid stars?
    const getStars = await database.getStarredPointersByUserID(USER_ID);
    expect(getStars.ok).toBeTruthy();
    expect(getStars.content.length).toEqual(1);

    // === Can we remove our star?
    const remStar = await database.updateDecrementStar(
      getUserID.content,
      "language-css"
    );
    expect(remStar.ok).toBeTruthy();
    expect(remStar.content).toEqual("Package Successfully Unstarred");

    // === What happens if the User try to remove a star from un unstarred package?
    const reRemStar = await database.updateDecrementStar(
      getUserID.content,
      "language-css"
    );
    expect(reRemStar.ok).toBeTruthy();
    expect(reRemStar.content).toEqual("The Star is Already Missing");

    // === Does our user now have valid stars?
    const getNoStars = await database.getStarredPointersByUserID(USER_ID);
    expect(getNoStars.ok).toBeTruthy();
    expect(getNoStars.content.length).toEqual(0);

    // === Can we remove our User?
    // TODO: Currently there is no way to delete a user account.
    // There is no supported endpoint for this, but is something that should be implemented.

    // Lets cleanup by deleting the package we made
    await database.removePackageByName("language-css", true);
  });
});

describe("Manage Login State Keys", () => {
  test("Save and Check State Key", async () => {
    // === Generate and save the State Key
    const stateKey = utils.generateRandomString(64);
    const savedDbKey = await database.authStoreStateKey(stateKey);
    expect(savedDbKey.ok).toBeTruthy();
    expect(savedDbKey.content).toEqual(stateKey);

    // === Check and delete the stored State Key
    const deleteDbKey = await database.authCheckAndDeleteStateKey(stateKey);
    expect(deleteDbKey.ok).toBeTruthy();
    expect(deleteDbKey.content).toEqual(stateKey);
  });
  test("Fail when an Unsaved State Key is provided", async () => {
    // === Test a State Key that has not been stored
    const stateKey = utils.generateRandomString(64);
    const notFoundDbKey = await database.authCheckAndDeleteStateKey(stateKey);
    expect(notFoundDbKey.ok).toBeFalsy();
    expect(notFoundDbKey.content).toEqual(
      "The provided state key was not set for the auth login."
    );
  });
  test("Fail when an Expired State Key is provided", async () => {
    // === Test an expired State Key when the user takes too long to complete the login stage
    const expiredStateKey = utils.generateRandomString(64);
    await database.authStoreStateKey(expiredStateKey);

    const testTimestamp = Date.now() + 601000; // 10 minutes after now
    const deleteExpiredDbKey = await database.authCheckAndDeleteStateKey(
      expiredStateKey,
      testTimestamp
    );
    expect(deleteExpiredDbKey.ok).toBeFalsy();
    expect(deleteExpiredDbKey.content).toEqual(
      "The provided state key is expired for the auth login."
    );
  });
});
