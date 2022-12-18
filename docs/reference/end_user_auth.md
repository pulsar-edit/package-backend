# Authentication to the Pulsar/Atom Backend as an End User

If you want to learn how authentication works within the code read here [auth.md](auth.md).

---

To authenticate with the Pulsar/Atom Backend you first need to create an account.

This can be done two separate ways. Either by Linking Pulsar to your GitHub User Account, or by directly generating your own PAT token and using that to authenticate.

## Sign in With GitHub

To login and create an account with your GitHub account, you'll want to visit [`/api/login`](https://api.pulsar-edit.dev/api/login).

When visiting this page you'll be redirected to GitHub, where you can choose the account you want to use to login, as well as review the permissions you are granting to Pulsar. These permissions follow the least access philosophy and only request what they need.

Once you've granted access to Pulsar to your User Account, you should then be redirected a few times, and land on your user home page.
Where you'll be able to review your account details and most importantly access your Pulsar API Key.

## Sign in with a Manually Created PAT Token

Otherwise to login and create an account with your GitHub PAT token, you'll first need to actually make a [PAT token.](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

Once you have your PAT token created, you'll need to pass that along to Pulsar during the sign on process.

You can do this manually, but it's recommended to use it on the [Pulsar Sign Up Screen](https://web.pulsar-edit.dev/login).

But if you'd like to do it manually, you need to navigate to the following URL [`/api/pat`](https://api.pulsar-edit.dev/api/pat) while modifying the following credentials.

* `token` = Your PAT Token

Let's say your PAT Token is `gh_123` you should end up with a link like so:

```
https://api.pulsar-edit.dev/api/pat?token=gh_123
```

By following this link you should then be redirected to the User Page on the Pulsar Website where you can review your account details, and copy your Pulsar API Key, which in this case is just the same PAT Token you've provided us.

## Disclosure about Pulsar User Accounts

Everyone here at Pulsar greatly respects your privacy, and more than that doesn't want the chance to even invade your privacy, or be responsible for your sensitive account credentials.

That's why when you create a User Account with Pulsar there are only three pieces of information stored about you.

* Your GitHub Account Username.
* Your GitHub Gravatar Image URL.
* Your GitHub `node_id`.

Think of your `node_id` like the random number GitHub assigned to your account when you created it. This is a public value that anyone on GitHub can find using the API and doesn't reveal any private details about yourself, your location or your account. Beyond this, the Pulsar backend collects zero information about who you are or where you live.
