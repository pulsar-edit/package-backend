/**
 * @module webhook
 * @desc Handles sending out webhooks based on function calls.
 */

const superagent = require("superagent");
const { WEBHOOK_PUBLISH, WEBHOOK_VERSION, WEBHOOK_USERNAME } =
  require("./config.js").getConfig();
const logger = require("./logger.js");

/**
 * @async
 * @function alertPublishPackage
 * @desc Used to send a webhook of a new package being published.
 * @param {object} pack - The full package object being published.
 * @param {object} user - The full user object.
 */
async function alertPublishPackage(pack, user) {
  // Lets do a safety check of the data we need
  if (typeof user.username !== "string" || typeof pack.name !== "string") {
    logger.generic(
      3,
      `Webhook for package ${pack?.name} was missing required fields!`
    );
    return;
  }

  // Now with our data we can generate the webhook data we want to send out.
  let sendObj = {
    username: WEBHOOK_USERNAME,
    content: `${user.username} Published ${pack.name} to Pulsar!`,
    embeds: [
      {
        url: `https://web.pulsar-edit.dev/packages/${pack.name}`,
        image: {
          url: `https://image.pulsar-edit.dev/packages/${pack.name}?image_kind=default`,
        },
      },
    ],
  };

  let sendHook = await sendWebHook(sendObj, WEBHOOK_PUBLISH);

  if (!sendHook.ok) {
    logger.generic(3, "Sending Package Publish webhook failed", {
      err: sendHook.content,
      type: "error",
    });
  }
  return;
}

/**
 * @async
 * @function alertPublishVersion
 * @desc Used to send a webhook of a new package version being published.
 * @param {object} pack - The full package object and version being published.
 * @param {object} user - The full user object.
 */
async function alertPublishVersion(pack, user) {
  // Lets do a safety check of the data we need.
  if (
    typeof user.username !== "string" ||
    typeof pack.metadata.version !== "string" ||
    typeof pack.name !== "string"
  ) {
    logger.generic(
      3,
      `Webhook for version of ${pack?.name} was missing required fields!`
    );
    return;
  }

  // Now with our data we can generate our webhook data.
  let sendObj = {
    username: WEBHOOK_USERNAME,
    content: `${user.username} Published version ${pack.metadata.version} of ${pack.name} to Pulsar!`,
    embeds: [
      {
        url: `https://web.pulsar-edit.dev/packages/${pack.name}`,
        image: {
          url: `https://image.pulsar-edit.dev/packages/${pack.name}?image_kind=default`,
        },
      },
    ],
  };

  let sendHook = await sendWebHook(sendObj, WEBHOOK_VERSION);

  if (!sendHook.ok) {
    logger.generic(3, "Sending Package Version Publish webhook failed", {
      err: sendHook.content,
      type: "error",
    });
  }
  return;
}

/**
 * @async
 * @function sendWebHook
 * @desc Used to preform the actual sending of the webhook.
 * @param {object} obj - The Object to send via the webhook
 * @param {string} webhookURL - The URL to send the webhook to.
 */
async function sendWebHook(obj, webhookURL) {
  try {
    // Send our webhook data
    await superagent.post(webhookURL).send(obj);
    // there was no error caught, so return
    return { ok: true };
  } catch (err) {
    // our webhook failed
    return {
      ok: false,
      content: err,
    };
  }
}

module.exports = {
  alertPublishPackage,
  alertPublishVersion,
  sendWebHook,
};
