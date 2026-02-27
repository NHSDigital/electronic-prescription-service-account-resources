#!/usr/bin/env python3
"""Compare CloudFormation templates and report logical ID mappings.

This utility pairs resources defined in legacy YAML templates with the
CDK-generated templates by correlating the logical IDs that appear in the
`Metadata/aws:cdk:path` field. It emits three JSON files:

1. `resource_mapping.json` - matched logical IDs between the two template sets.
2. `set1_unmatched.json` - resources that exist only in the YAML templates.
3. `set2_unmatched.json` - resources that exist only in the CDK templates.

The script assumes PyYAML is available. Install it with `pip install pyyaml`
if needed.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

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
DEFAULT_OUTPUT_DIR = "template_comparison_results"


@dataclass(frozen=True)
class ResourceRecord:
    template: str
    logical_id: str
    resource_type: str
    metadata_path: Optional[str]
    raw_logical_id: Optional[str] = None

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


def build_set1_records(paths: Iterable[Path]) -> List[ResourceRecord]:
    records: List[ResourceRecord] = []
    for template_path in paths:
        resources = load_yaml_resources(template_path)
        for logical_id, definition in resources.items():
            resource_type = definition.get("Type")
            if not resource_type:
                continue
            records.append(
                ResourceRecord(
                    template=str(template_path),
                    logical_id=logical_id,
                    resource_type=resource_type,
                    metadata_path=None,
                    raw_logical_id=logical_id,
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
            records.append(
                ResourceRecord(
                    template=str(template_path),
                    logical_id=candidate,
                    resource_type=resource_type,
                    metadata_path=metadata_path,
                    raw_logical_id=logical_id,
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


def compare_templates(set1: List[ResourceRecord], set2: List[ResourceRecord]):
    set2_lookup: Dict[Tuple[str, str], List[ResourceRecord]] = {}
    for record in set2:
        set2_lookup.setdefault(record.match_key, []).append(record)

    mapping = []
    set1_only = []
    matched_set2 = set()

    for record in set1:
        candidates = set2_lookup.get(record.match_key, [])
        match = next((c for c in candidates if c not in matched_set2), None)
        if match:
            matched_set2.add(match)
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
        if record not in matched_set2
    ]

    return mapping, set1_only, set2_only


def write_json(data, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True))


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

    mapping, set1_only, set2_only = compare_templates(set1_records, set2_records)

    output_base = (base_dir / args.output_dir).resolve()
    write_json(mapping, output_base / "resource_mapping.json")
    write_json(set1_only, output_base / "set1_unmatched.json")
    write_json(set2_only, output_base / "set2_unmatched.json")

    print(f"Wrote {len(mapping)} mappings")
    print(f"Wrote {len(set1_only)} set1-only resources")
    print(f"Wrote {len(set2_only)} set2-only resources")


if __name__ == "__main__":
    main()
