import {Construct} from "constructs"
import {ECRRepository} from "../constructs/ECRRepository"

export class ECRRepositories extends Construct {

  public constructor(scope: Construct, id: string){
    super(scope, id)
    const repositoryNames = [
      // these are commented out until they are removed from account-resources cloudformation stack
      // and then imported into this stack
      // "fhir-facade-repo",
      // "validator-repo",
      // "cdk-utils-build-repo",
      "dev-container-account-resources",
      "dev-container-fhir-facade",
      "dev-container-pfp",
      "dev-container-psu",
      "dev-container-prescription-tracker-api",
      "dev-container-prescription-tracker-ui",
      "dev-container-fhir-validator-lambda",
      "dev-container-fhir-validator-docker",
      "dev-container-release-notes",
      "dev-container-get-secrets",
      "dev-container-fhir-middy-error-handler",
      "dev-container-spine-client",
      "dev-container-load-test",
      "dev-container-regression-tests",
      "dev-container-action-sbom",
      "dev-container-action-cfn-lint",
      "dev-container-aws-dashboards",
      "dev-container-storage-terraform",
      "dev-container-semantic-release",
      "dev-container-dependabot",
      "dev-container-cdk-utils",
      "dev-container-assist-me",
      "dev-container-vpc-resources",
      "dev-container-common-workflows",
      "git-secrets",
      "deployment-utils"
    ]
    for (const repositoryName of repositoryNames){
      new ECRRepository(this, repositoryName, {
        repositoryName: repositoryName
      })
    }
  }
}
