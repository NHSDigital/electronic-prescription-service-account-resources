#!/usr/bin/env python3
"""Compare CloudFormation templates and report logical ID mappings.

This utility pairs resources defined in legacy YAML templates with the
CDK-generated templates by correlating the logical IDs that appear in the
`Metadata/aws:cdk:path` field. It emits three JSON files:

1. `resource_mapping.json` - matched logical IDs between the two template sets.
2. `set1_unmatched.json` - resources that exist only in the YAML templates.
3. `set2_unmatched.json` - resources that exist only in the CDK templates.
4. `resource_differences.json` - matched resources whose definitions differ
    (ignoring Metadata and Tags).

The script assumes PyYAML is available. Install it with `pip install pyyaml`
if needed.
"""

from __future__ import annotations

import argparse
import json
import copy
import datetime
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import yaml  # type: ignore
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML is required to parse the YAML templates. Install it with 'pip install pyyaml'."
    ) from exc


class CloudFormationLoader(yaml.SafeLoader):
    """Lenient loader that tolerates intrinsic CloudFormation tags."""


def _cloudformation_multi_constructor(loader, tag_suffix, node):
    if isinstance(node, yaml.nodes.ScalarNode):
        return loader.construct_scalar(node)
    if isinstance(node, yaml.nodes.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


CloudFormationLoader.add_multi_constructor("!", _cloudformation_multi_constructor)


DEFAULT_SET1 = [
    "cloudformation/account_resources.yml",
    "cloudformation/ci_resources.yml",
    "cloudformation/secrets.yml",
]
DEFAULT_SET2 = [
    "cdk.out/AccountResources_UK.template.json",
    "cdk.out/IAM.template.json",
    "cdk.out/Monitoring.template.json",
]
DEFAULT_OUTPUT_DIR = "cdk.out/template_comparison_results"
MANUAL_MAPPINGS = {
    # Set1 logical ID -> Metadata/aws:cdk:path override for Set2
    "CloudwatchResourcePolicy": "IAM/Policies/AWSLogDeliveryWrite20150319/ResourcePolicy",
    "FHIRFacadeRepo": "AccountResources_UK/ECRRepositories/fhir-facade-repo/fhir-facade-repo/Resource",
    "ValidatorRepo": "AccountResources_UK/ECRRepositories/validator-repo/validator-repo/Resource",
    "CDKUtilsBuildRepo": "AccountResources_UK/ECRRepositories/cdk-utils-build-repo/cdk-utils-build-repo/Resource",
    "SecretsKMSKeyKMSKeyAlias": "AccountResources_UK/Encryption/SecretsKMSKey/Alias/Resource",
    "PfpCAKeySecret": "AccountResources_UK/MTLSSecrets/PfpCAKey/staticSecret/Resource",
    "PfpCACertSecret": "AccountResources_UK/MTLSSecrets/PfpCACert/staticSecret/Resource",
    "PfpClientKeySecret": "AccountResources_UK/MTLSSecrets/PfpClientKey/staticSecret/Resource",
    "PfpClientCertSecret": "AccountResources_UK/MTLSSecrets/PfpClientCert/staticSecret/Resource",
    "PfpClientSandboxKeySecret": "AccountResources_UK/MTLSSecrets/PfpClientSandboxKey/staticSecret/Resource",
    "PfpClientSandboxCertSecret": "AccountResources_UK/MTLSSecrets/PfpClientSandboxCert/staticSecret/Resource",
    "ClinicalTrackerCAKeySecret": "AccountResources_UK/MTLSSecrets/ClinicalTrackerCAKey/staticSecret/Resource",
    "ClinicalTrackerCACertSecret": "AccountResources_UK/MTLSSecrets/ClinicalTrackerCACert/staticSecret/Resource",
    "ClinicalTrackerClientKeySecret": "AccountResources_UK/MTLSSecrets/ClinicalTrackerClientKey/staticSecret/Resource",
    "ClinicalTrackerClientCertSecret":
        "AccountResources_UK/MTLSSecrets/ClinicalTrackerClientCert/staticSecret/Resource",
    "ClinicalTrackerClientSandboxKeySecret":
        "AccountResources_UK/MTLSSecrets/ClinicalTrackerClientSandboxKey/staticSecret/Resource",
    "ClinicalTrackerClientSandboxCertSecret":
        "AccountResources_UK/MTLSSecrets/ClinicalTrackerClientSandboxCert/staticSecret/Resource",
    "PsuCAKeySecret": "AccountResources_UK/MTLSSecrets/PSUCAKey/staticSecret/Resource",
    "PsuCACertSecret": "AccountResources_UK/MTLSSecrets/PSUCACert/staticSecret/Resource",
    "PsuClientKeySecret": "AccountResources_UK/MTLSSecrets/PSUClientKey/staticSecret/Resource",
    "PsuClientCertSecret": "AccountResources_UK/MTLSSecrets/PSUClientCert/staticSecret/Resource",
    "PsuClientSandboxKeySecret": "AccountResources_UK/MTLSSecrets/PSUClientSandboxKey/staticSecret/Resource",
    "PsuClientSandboxCertSecret": "AccountResources_UK/MTLSSecrets/PSUClientSandboxCert/staticSecret/Resource",
    "FhirFacadeCAKeySecret": "AccountResources_UK/MTLSSecrets/FhirFacadeCAKey/staticSecret/Resource",
    "FhirFacadeCACertSecret": "AccountResources_UK/MTLSSecrets/FhirFacadeCACert/staticSecret/Resource",
    "FhirFacadeClientKeySecret": "AccountResources_UK/MTLSSecrets/FhirFacadeClientKey/staticSecret/Resource",
    "FhirFacadeClientCertSecret": "AccountResources_UK/MTLSSecrets/FhirFacadeClientCert/staticSecret/Resource",
    "FhirFacadeClientSandboxKeySecret":
        "AccountResources_UK/MTLSSecrets/FhirFacadeClientSandboxKey/staticSecret/Resource",
    "SpinePrivateKey": "AccountResources_UK/ConfigSecrets/SpinePrivateKey/staticSecret/Resource",
    "SpinePublicCertificate": "AccountResources_UK/ConfigSecrets/SpinePublicCertificate/staticSecret/Resource",
    "SpineASID": "AccountResources_UK/ConfigSecrets/SpineASID/staticSecret/Resource",
    "SpinePartyKey": "AccountResources_UK/ConfigSecrets/SpinePartyKey/staticSecret/Resource",
    "SpineCAChain": "AccountResources_UK/ConfigSecrets/SpineCAChain/staticSecret/Resource",
    "ServiceSearchApiKey": "AccountResources_UK/ConfigSecrets/ServiceSearchApiKey/staticSecret/Resource",
    "JiraToken": "AccountResources_UK/AtlassianSecrets/JiraToken/staticSecret/Resource",
    "ConfluenceToken": "AccountResources_UK/AtlassianSecrets/ConfluenceToken/staticSecret/Resource",
    "PSUProxygenPrivateKey": "AccountResources_UK/ProxygenSecrets/PSUProxygenPrivateKey/staticSecret/Resource",
    "PSUProxygenPublicKey": "AccountResources_UK/ProxygenSecrets/PSUProxygenPublicKey/staticSecret/Resource",
    "CPSUProxygenPrivateKey": "AccountResources_UK/ProxygenSecrets/CPSUProxygenPrivateKey/staticSecret/Resource",
    "CPSUProxygenPublicKey": "AccountResources_UK/ProxygenSecrets/CPSUProxygenPublicKey/staticSecret/Resource",
    "ClinicalTrackerProxygenPrivateKey":
        "AccountResources_UK/ProxygenSecrets/ClinicalTrackerProxygenPrivateKey/staticSecret/Resource",
    "ClinicalTrackerProxygenPublicKey":
        "AccountResources_UK/ProxygenSecrets/ClinicalTrackerProxygenPublicKey/staticSecret/Resource",
    "FhirFacadeClientSandboxCertSecret":
        "AccountResources_UK/MTLSSecrets/FhirFacadeClientSandboxCert/staticSecret/Resource",
    "SplunkHECToken": "AccountResources_UK/ConfigSecrets/SplunkHECToken/staticSecret/Resource",
    "SlackWebHookUrl": "AccountResources_UK/ConfigSecrets/SlackWebHookUrl/staticSecret/Resource",
    "PrescribingProxygenPrivateKey":
        "AccountResources_UK/ProxygenSecrets/PrescribingProxygenPrivateKey/staticSecret/Resource",
    "PrescribingProxygenPublicKey":
        "AccountResources_UK/ProxygenSecrets/PrescribingProxygenPublicKey/staticSecret/Resource",
    "DispensingProxygenPrivateKey":
        "AccountResources_UK/ProxygenSecrets/DispensingProxygenPrivateKey/staticSecret/Resource",
    "DispensingProxygenPublicKey":
        "AccountResources_UK/ProxygenSecrets/DispensingProxygenPublicKey/staticSecret/Resource",
    "PrescriptionsForPatientsProxygenPrivateKey":
        "AccountResources_UK/ProxygenSecrets/PrescriptionsForPatientsProxygenPrivateKey/staticSecret/Resource",
    "PrescriptionsForPatientsProxygenPublicKey":
        "AccountResources_UK/ProxygenSecrets/PrescriptionsForPatientsProxygenPublicKey/staticSecret/Resource",
    "epsSigningCertChain": "AccountResources_UK/ConfigSecrets/EPSSigningCertChain/staticSecret/Resource",
    "ptlPrescriptionSigningPrivateKey":
        "AccountResources_UK/ConfigSecrets/PTLPrescriptionSigningPrivateKey/staticSecret/Resource",
    "ptlPrescriptionSigningPublicKey":
        "AccountResources_UK/ConfigSecrets/PTLPrescriptionSigningPublicKey/staticSecret/Resource",

}


@dataclass(frozen=True)
class ResourceRecord:
    template: str
    logical_id: str
    resource_type: str
    metadata_path: Optional[str]
    raw_logical_id: Optional[str] = None
    definition: Optional[Dict[str, Any]] = None
    sanitized_definition: Optional[Dict[str, Any]] = None
    normalized_definition: Optional[Any] = None

    @property
    def match_key(self) -> Tuple[str, str]:
        return self.logical_id, self.resource_type


def load_yaml_resources(path: Path) -> Dict[str, Dict]:
    data = yaml.load(path.read_text(), Loader=CloudFormationLoader) or {}
    return data.get("Resources", {}) or {}


def load_json_resources(path: Path) -> Dict[str, Dict]:
    data = json.loads(path.read_text())
    return data.get("Resources", {}) or {}


def extract_candidate_from_path(metadata_path: Optional[str]) -> Optional[str]:
    if not metadata_path:
        return None
    candidate = metadata_path.rstrip('/')
    suffixes = ["/Resource", "/Default", "/Resource/Resource"]
    trimmed = True
    while trimmed:
        trimmed = False
        for suffix in suffixes:
            if candidate.endswith(suffix):
                candidate = candidate[: -len(suffix)]
                trimmed = True
    candidate = candidate.rstrip('/')
    if not candidate:
        return None
    return candidate.split('/')[-1]


def sanitize_definition(definition: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not definition:
        return {}
    clean = copy.deepcopy(definition)
    clean.pop("Metadata", None)
    props = clean.get("Properties")
    if isinstance(props, dict):
        props.pop("Tags", None)
    return clean


def normalize_structure(value: Any) -> Any:
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: normalize_structure(value[key]) for key in sorted(value.keys())}
    if isinstance(value, list):
        normalized = [normalize_structure(item) for item in value]
        if len(normalized) == 1:
            return normalized[0]
        return normalized
    return value


def build_set1_records(paths: Iterable[Path]) -> List[ResourceRecord]:
    records: List[ResourceRecord] = []
    for template_path in paths:
        resources = load_yaml_resources(template_path)
        for logical_id, definition in resources.items():
            resource_type = definition.get("Type")
            if not resource_type:
                continue
            sanitized_definition = sanitize_definition(definition)
            normalized_definition = normalize_structure(sanitized_definition)
            records.append(
                ResourceRecord(
                    template=str(template_path),
                    logical_id=logical_id,
                    resource_type=resource_type,
                    metadata_path=None,
                    raw_logical_id=logical_id,
                    definition=definition,
                    sanitized_definition=sanitized_definition,
                    normalized_definition=normalized_definition,
                )
            )
    return records


def build_set2_records(paths: Iterable[Path]) -> List[ResourceRecord]:
    records: List[ResourceRecord] = []
    for template_path in paths:
        resources = load_json_resources(template_path)
        for logical_id, definition in resources.items():
            resource_type = definition.get("Type")
            if not resource_type:
                continue
            metadata = definition.get("Metadata", {})
            metadata_path = metadata.get("aws:cdk:path")
            candidate = extract_candidate_from_path(metadata_path) or logical_id
            sanitized_definition = sanitize_definition(definition)
            normalized_definition = normalize_structure(sanitized_definition)
            records.append(
                ResourceRecord(
                    template=str(template_path),
                    logical_id=candidate,
                    resource_type=resource_type,
                    metadata_path=metadata_path,
                    raw_logical_id=logical_id,
                    definition=definition,
                    sanitized_definition=sanitized_definition,
                    normalized_definition=normalized_definition,
                )
            )
    return records


def resolve_paths(base_dir: Path, relative_paths: Iterable[str]) -> List[Path]:
    resolved: List[Path] = []
    for rel_path in relative_paths:
        path = (base_dir / rel_path).resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Template not found: {path}")
        resolved.append(path)
    return resolved


def compare_templates(
    set1: List[ResourceRecord],
    set2: List[ResourceRecord],
    manual_mappings: Optional[Dict[str, str]] = None,
):
    manual_mappings = manual_mappings or {}
    set2_lookup: Dict[Tuple[str, str], List[ResourceRecord]] = {}
    set2_path_lookup: Dict[str, List[ResourceRecord]] = {}
    for record in set2:
        set2_lookup.setdefault(record.match_key, []).append(record)
        if record.metadata_path:
            set2_path_lookup.setdefault(record.metadata_path, []).append(record)

    mapping = []
    set1_only = []
    matched_set2 = set()
    manual_misses = []
    differences = []

    for record in set1:
        match = None
        manual_path = manual_mappings.get(record.raw_logical_id or "")
        if manual_path:
            manual_candidates = set2_path_lookup.get(manual_path, [])
            match = next((c for c in manual_candidates if id(c) not in matched_set2), None)
            if match is None:
                manual_misses.append(
                    {
                        "logical_id": record.raw_logical_id,
                        "manual_path": manual_path,
                        "reason": "manual_path_not_found",
                    }
                )
        if match is None:
            candidates = set2_lookup.get(record.match_key, [])
            match = next((c for c in candidates if id(c) not in matched_set2), None)
        if match:
            matched_set2.add(id(match))
            mapping.append(
                {
                    "set1_template": record.template,
                    "set1_logical_id": record.raw_logical_id,
                    "set1_type": record.resource_type,
                    "set2_template": match.template,
                    "set2_logical_id": match.raw_logical_id,
                    "set2_type": match.resource_type,
                    "cdk_path": match.metadata_path,
                }
            )
            if record.normalized_definition != match.normalized_definition:
                differences.append(
                    {
                        "set1_template": record.template,
                        "set1_logical_id": record.raw_logical_id,
                        "set2_template": match.template,
                        "set2_logical_id": match.raw_logical_id,
                        "set2_cdk_path": match.metadata_path,
                        "set1_definition": record.sanitized_definition,
                        "set2_definition": match.sanitized_definition,
                    }
                )
        else:
            set1_only.append(
                {
                    "template": record.template,
                    "logical_id": record.raw_logical_id,
                    "type": record.resource_type,
                }
            )

    set2_only = [
        {
            "template": record.template,
            "logical_id": record.raw_logical_id,
            "type": record.resource_type,
            "cdk_path": record.metadata_path,
        }
        for record in set2
        if id(record) not in matched_set2
    ]

    return mapping, set1_only, set2_only, manual_misses, differences


def write_json(data, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True, default=str))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-dir",
        default=Path.cwd(),
        type=Path,
        help="Base directory that contains the template files.",
    )
    parser.add_argument(
        "--set1",
        nargs="*",
        default=DEFAULT_SET1,
        help="YAML templates (legacy set).",
    )
    parser.add_argument(
        "--set2",
        nargs="*",
        default=DEFAULT_SET2,
        help="JSON templates (CDK-generated set).",
    )
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        help="Directory to write the comparison artifacts.",
    )
    args = parser.parse_args()

    base_dir = args.base_dir.resolve()
    set1_paths = resolve_paths(base_dir, args.set1)
    set2_paths = resolve_paths(base_dir, args.set2)

    set1_records = build_set1_records(set1_paths)
    set2_records = build_set2_records(set2_paths)

    mapping, set1_only, set2_only, manual_misses, differences = compare_templates(
        set1_records, set2_records, MANUAL_MAPPINGS
    )

    output_base = (base_dir / args.output_dir).resolve()
    write_json(mapping, output_base / "resource_mapping.json")
    write_json(set1_only, output_base / "set1_unmatched.json")
    write_json(set2_only, output_base / "set2_unmatched.json")
    write_json(differences, output_base / "resource_differences.json")

    print(f"Wrote {len(mapping)} mappings")
    print(f"Wrote {len(set1_only)} set1-only resources")
    print(f"Wrote {len(set2_only)} set2-only resources")
    print(f"Wrote {len(differences)} resource definition differences")
    if manual_misses:
        print("Manual mappings that could not be resolved:")
        for miss in manual_misses:
            print(f"  - {miss['logical_id']} -> {miss['manual_path']} ({miss['reason']})")


if __name__ == "__main__":
    main()
