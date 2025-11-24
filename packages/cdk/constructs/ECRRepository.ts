import {Duration} from "aws-cdk-lib"
import {LifecycleRule, Repository, TagStatus} from "aws-cdk-lib/aws-ecr"
import {Construct} from "constructs"

export interface ECRRepositoryProps {
  readonly repositoryName: string
}

export class ECRRepository extends Construct {
  repository: Repository
  public constructor(scope: Construct, id: string, props: ECRRepositoryProps){
    super(scope, id)

    const deleteOldPRImagesLifecycleRule: LifecycleRule = {
      rulePriority: 1,
      description: "Delete PR- images older than 60 days",
      maxImageAge: Duration.days(60),
      tagPrefixList: ["PR-"]
    }

    const deleteUntaggedImagesLifecycleRule: LifecycleRule = {
      rulePriority: 2,
      description: "Delete untagged images older than 7 days",
      maxImageAge: Duration.days(7),
      tagStatus: TagStatus.UNTAGGED
    }

    const keep5RecentReleaseImagesLifecycleRule: LifecycleRule = {
      rulePriority: 3,
      description: "Keep at least 5 most recent v tagged images, delete older images beyond that",
      maxImageCount: 5,
      tagPrefixList: ["v"]
    }

    const lifecycleRules = [
      deleteOldPRImagesLifecycleRule,
      deleteUntaggedImagesLifecycleRule,
      keep5RecentReleaseImagesLifecycleRule
    ]
    const repository = new Repository(this, props.repositoryName, {
      repositoryName: props.repositoryName,
      imageScanOnPush: true,
      lifecycleRules: lifecycleRules
    })

    this.repository = repository
  }
}
