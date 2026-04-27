
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"

export interface AtlassianSecretsProps {
  readonly stackName: string
  readonly atlassianSecretsKmsKey: IKey
}
export class AtlassianSecrets extends Construct {

  public constructor(scope: Construct, id: string, props: AtlassianSecretsProps){
    super(scope, id)

    new StaticSecret(this, "ConfluenceToken", {
      secretName:  `${props.stackName}-confluenceToken`,
      description: "Confluence token for creating release notes",
      encryptionKey: props.atlassianSecretsKmsKey
    })
    new StaticSecret(this, "JiraToken", {
      secretName:  `${props.stackName}-jiraToken`,
      description: "Jira token for creating release notes",
      encryptionKey: props.atlassianSecretsKmsKey
    })

  }
}
