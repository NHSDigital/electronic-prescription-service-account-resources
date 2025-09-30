import {Construct} from "constructs"
import {CfnFilter} from "aws-cdk-lib/aws-inspectorv2"

export class InspectorFilters extends Construct {

  public constructor(scope: Construct, id: string){
    super(scope, id)

    // This is a list of CVEs that are being suppressed in AWS Inspector findings.
    // These CVEs have been reviewed and deemed to be either false positives,
    // not applicable to our environment, or have acceptable risk levels.
    // Regular reviews should be conducted to ensure that these suppressions
    // remain valid as our environment and threat landscape evolve.
    //
    // Most are due to us having to run an older version of hapi fhir
    //
    const cvesToSuppress = [
      "CVE-2025-22235", // https://nvd.nist.gov/vuln/detail/cve-2025-22235
      "CVE-2025-21587", // https://nvd.nist.gov/vuln/detail/cve-2025-21587
      "CVE-2024-55887", // https://nvd.nist.gov/vuln/detail/cve-2024-55887
      "CVE-2024-52007", // https://nvd.nist.gov/vuln/detail/cve-2024-52007
      "CVE-2024-51132", // https://nvd.nist.gov/vuln/detail/cve-2024-51132
      "CVE-2024-45294", // https://nvd.nist.gov/vuln/detail/cve-2024-45294
      "CVE-2023-2976", // https://nvd.nist.gov/vuln/detail/cve-2023-2976
      "CVE-2023-28465", // https://nvd.nist.gov/vuln/detail/cve-2023-28465
      "CVE-2023-24057", // https://nvd.nist.gov/vuln/detail/cve-2023-24057
      "CVE-2022-42889", // https://nvd.nist.gov/vuln/detail/cve-2022-42889
      "CVE-2021-36090", // https://nvd.nist.gov/vuln/detail/cve-2021-36090
      "CVE-2021-35517", // https://nvd.nist.gov/vuln/detail/cve-2021-35517
      "CVE-2021-35516", // https://nvd.nist.gov/vuln/detail/cve-2021-35516
      "CVE-2021-35515", // https://nvd.nist.gov/vuln/detail/cve-2021-35515
      "CVE-2025-31650", // https://nvd.nist.gov/vuln/detail/cve-2025-31650
      "CVE-2025-31651", // https://nvd.nist.gov/vuln/detail/cve-2025-31651
      "CVE-2025-23166", // https://nvd.nist.gov/vuln/detail/cve-2025-23166
      "CVE-2025-46701", // https://nvd.nist.gov/vuln/detail/cve-2025-46701
      "CVE-2025-48988", // https://nvd.nist.gov/vuln/detail/cve-2025-48988
      "CVE-2025-49125", // https://nvd.nist.gov/vuln/detail/cve-2025-49125
      "CVE-2025-50059", // https://nvd.nist.gov/vuln/detail/cve-2025-50059
      "CVE-2025-30749", // https://nvd.nist.gov/vuln/detail/cve-2025-30749
      "CVE-2025-50106", // https://nvd.nist.gov/vuln/detail/cve-2025-50106
      "CVE-2025-27210", // https://nvd.nist.gov/vuln/detail/cve-2025-27210
      "CVE-2025-52520", // https://nvd.nist.gov/vuln/detail/cve-2025-52520
      "CVE-2025-48989", // https://nvd.nist.gov/vuln/detail/cve-2025-48989
      "CVE-2025-53506", // https://nvd.nist.gov/vuln/detail/cve-2025-53506
      "CVE-2025-57319" // https://nvd.nist.gov/vuln/detail/cve-2025-57319 - this is a false positive and is not an issue
    ]

    for (const cve of cvesToSuppress){
      new CfnFilter(this, `Suppress${cve.replace(/-/g, "")}`, {
        filterAction: "SUPPRESS",
        filterCriteria: {
          vulnerabilityId: [{
            comparison: "EQUALS",
            value: cve
          }]
        },
        name: `Suppress ${cve}`,
        description: `Suppress ${cve} findings`
      })
    }

  }
}
