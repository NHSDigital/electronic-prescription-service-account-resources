import {Fn} from "aws-cdk-lib"
import {IOidcProvider, OidcProviderNative} from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs"

export interface IdentityProviderProps {
  readonly importResources: boolean
}
export class IdentityProvider extends Construct {
  public readonly gitHubIdentityProvider: IOidcProvider
  public constructor(scope: Construct, id: string, props: IdentityProviderProps) {
    super(scope, id)

    if (props.importResources) {
      this.gitHubIdentityProvider = OidcProviderNative.fromOidcProviderArn(
        this, "GitHubIdentityProvider", Fn.importValue("<ADD IMPORT NAME>"))
    } else {
      this.gitHubIdentityProvider = new OidcProviderNative(this, "GitHubIdentityProvider", {
        url: "https://token.actions.githubusercontent.com",
        clientIds: [ "sts.amazonaws.com", "eps-storage-terraform" ],
        thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"]
      })
    }
  }
}
