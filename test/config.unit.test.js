const config = require("../src/config.js");
const Joi = require("joi");

describe("Config Returns all Expected Values", () => {
  let con = config.getConfig();

  test("Contains all required keys", async () => {
    const schema = Joi.object()
      .keys({
        port: Joi.number().integer().required(),
        server_url: Joi.string().allow("").required(),
        paginated_amount: Joi.number().integer().required(),
        prod: Joi.boolean().required(),
        cache_time: Joi.number().integer().required(),
        GCLOUD_STORAGE_BUCKET: Joi.string().allow("").required(),
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().allow("").required(),
        GH_CLIENTID: Joi.string().allow("").required(),
        GH_USERAGENT: Joi.string().allow("").required(),
        GH_REDIRECTURI: Joi.string().allow("").required(),
        GH_CLIENTSECRET: Joi.string().allow("").required(),
        DB_HOST: Joi.string().allow("").required(),
        DB_USER: Joi.string().allow("").required(),
        DB_PASS: Joi.string().allow("").required(),
        DB_DB: Joi.string().allow("").required(),
        DB_PORT: Joi.number().integer().required(),
        DB_SSL_CERT: Joi.string().allow("").required(),
        LOG_LEVEL: Joi.number().integer().required(),
        LOG_FORMAT: Joi.string().allow("").required(),
        RATE_LIMIT_GENERIC: Joi.number().integer().required(),
        RATE_LIMIT_AUTH: Joi.number().integer().required(),
      })
      .required();

    expect(con).toMatchSchema(schema);
  });
});
