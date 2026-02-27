import {IOidcProvider, OidcProviderNative} from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs"

export class IdentityProvider extends Construct {
  public readonly gitHubIdentityProvider: IOidcProvider
  public constructor(scope: Construct, id: string) {
    super(scope, id)

    const gitHubIdentityProvider = new OidcProviderNative(this, "GitHubIdentityProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: [ "sts.amazonaws.com", "eps-storage-terraform" ],
      thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"]
    })
    this.gitHubIdentityProvider = gitHubIdentityProvider
  }
}
