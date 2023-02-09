const config = require("../config.js");
const Joi = require("joi");
const jestJoi = require("jest-joi");

expect.extend(jestJoi.matchers);

describe("Config Returns all Expected Values", () => {
  let con = config.getConfig();

  test("Contains all required keys", async () => {

    const schema = Joi.object().keys({
      port: Joi.number().integer().required(),
      server_url: Joi.string().required(),
      paginated_amount: Joi.number().integer().required(),
      prod: Joi.boolean().required(),
      cache_time: Joi.number().integer().required(),
      GCLOUD_STORAGE_BUCKET: Joi.string().required(),
      GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
      GH_CLIENTID: Joi.string().required(),
      GH_USERAGENT: Joi.string().required(),
      GH_REDIRECTURI: Joi.string().required(),
      GH_CLIENTSECRET: Joi.string().required(),
      DB_HOST: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASS: Joi.string().required(),
      DB_DB: Joi.string().required(),
      DB_PORT: Joi.number().integer().required(),
      DB_SSL_CERT: Joi.string().required(),
      LOG_LEVEL: Joi.number().integer().required(),
      LOG_FORMAT: Joi.string().required()
    }).required();

    expect(con).toMatchSchema(schema);

  });

});
