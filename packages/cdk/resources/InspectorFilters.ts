import {Construct} from "constructs"
import {CfnFilter} from "aws-cdk-lib/aws-inspectorv2"

type CveSuppression = {
  id: string
  expiry: Date
}
export class InspectorFilters extends Construct {

  public constructor(scope: Construct, id: string){
    super(scope, id)

    // This is a list of CVEs that are being suppressed in AWS Inspector findings.
    // Each CVE has an associated expiry date. Filters will only be added if the expiry date is less than today.
    const cvesToSuppress: Array<CveSuppression> = [
    ]

    const today = new Date()

    for (const cve of cvesToSuppress) {
      if (cve.expiry > today) {
        new CfnFilter(this, `Suppress${cve.id.replace(/-/g, "")}`, {
          filterAction: "SUPPRESS",
          filterCriteria: {
            vulnerabilityId: [{
              comparison: "EQUALS",
              value: cve.id
            }]
          },
          name: `Suppress ${cve.id}`,
          description: `Suppress ${cve.id} findings`
        })
      }
    }
  }
}
