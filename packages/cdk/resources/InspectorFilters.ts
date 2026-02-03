import {Construct} from "constructs"
import {CfnFilter} from "aws-cdk-lib/aws-inspectorv2"

export class InspectorFilters extends Construct {

  public constructor(scope: Construct, id: string){
    super(scope, id)

    // This is a list of CVEs that are being suppressed in AWS Inspector findings.
    // Each CVE has an associated expiry date. Filters will only be added if the expiry date is less than today.
    const cvesToSuppress = [
      {id: "CVE-2023-24057", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2023-24057
      // validator repo
      // hapi-fhir
      {id: "CVE-2025-50059", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2025-50059
      // validator repo
      // jdk
      {id: "CVE-2023-28465", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2023-28465
      // validator repo
      // hapi-fhir
      {id: "CVE-2025-30749", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2025-30749
      // validator repo
      // jdk
      {id: "CVE-2021-36090", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2021-36090
      // validator repo
      // org.apache.commons:commons-compress
      {id: "CVE-2021-35515", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2021-35515
      // validator repo
      // org.apache.commons:commons-compress
      {id: "CVE-2024-55887", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2024-55887
      // validator repo
      // org.fhir:ucum
      {id: "CVE-2021-35516", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2021-35516
      // validator repo
      // org.apache.commons:commons-compress
      {id: "CVE-2023-2976", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2023-2976
      // validator repo
      // com.google.guava:guava
      {id: "CVE-2022-42889", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2022-42889
      // validator repo
      // org.apache.commons:commons-text
      {id: "CVE-2024-52007", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2024-52007
      // validator repo
      // hapi-fhir
      {id: "CVE-2021-35517", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2021-35517
      // validator repo
      // org.apache.commons:commons-compress
      {id: "CVE-2025-50106", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2025-50106
      // validator repo
      // jdk
      {id: "CVE-2024-45294", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2024-45294
      // validator repo
      // hapi-fhir
      {id: "CVE-2024-51132", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2024-51132
      // validator repo
      // hapi-fhir
      {id: "CVE-2025-21587", expiry: new Date("2027-01-01")}, // https://nvd.nist.gov/vuln/detail/cve-2025-21587
      // validator repo
      // jdk

      {id: "CVE-2025-9230", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-9230
      // cdk-utils repo
      // not applicable, we do not use password-based encryption in CMS messages
      {id: "CVE-2025-61725", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-61725
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-47907", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-47907
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-61723", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-61723
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-58187", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-58187
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-58188", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-58188
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-22871", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-22871
      // cdk-utils repo
      // from go stdlib used in asdf, not applicable
      {id: "CVE-2025-64756", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-64756
      // cdk utils and fhir facade repo
      // imported from asdf and node
      // suppression of vulnerability in glob shell - we do not use this so fine to suppress
      {id: "CVE-2025-61729", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-61729
      // cdk-utils repo
      // suppression of vulnerability in golang stdlib - imported from asdf. Fine to suppress
      {id: "CVE-2026-23745", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-23745
      // cdk-utils and fhir facade repo
      // suppression of vulnerability in tar. Waiting for npm to release fix https://github.com/npm/cli/issues/8917
      {id: "CVE-2026-23950", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2026-23950
      // cdk-utils repo
      // suppression of vulnerability in tar. Waiting for next release of node 24.x
      {id: "CVE-2026-24049", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2026-24049
      // cdk-utils repo
      // suppression of vulnerability in python wheel installed by aws-cli. Waiting for new release upstream
      {id: "CVE-2025-69420", expiry: new Date("2026-06-01")}, // https://nvd.nist.gov/vuln/detail/CVE-2025-69420
      // fhir facade repo
      // suppression of vulnerability in openssl TimeStamp response verification - not applicable to our use case
      {id: "CVE-2026-24842", expiry: new Date("2026-06-01")} // https://nvd.nist.gov/vuln/detail/CVE-2026-24842
      // fhir facade repo
      // suppression of vulnerability in node tar - not applicable to our use case

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
