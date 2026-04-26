interface ExportValue {
  dev: string
  ref: string
  qa: string
  int: string
  prod: string
}

const exportValues: { [key: string]: ExportValue } = {
  "account-resources:AccessSlackSecretsManagedPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-AccessSlackSecretsManagedPolicy-hmBJFz5RrhNe",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-AccessSlackSecretsManagedPolicy-c2i2H0uiumbc",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-AccessSlackSecretsManagedPolicy-w6NEv6YBc5RC",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-AccessSlackSecretsManagedPolicy-LxXkkyoWANj1",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-AccessSlackSecretsManagedPolicy-TDTOzjwU8JO6"
  },
  "account-resources:ALBLoggingBucketName": {
    dev:
      "account-resources-albloggingbucket-ctsds3hohyju",
    ref:
      "account-resources-albloggingbucket-syg2jemmjbky",
    qa:
      "account-resources-albloggingbucket-fvgl9tjhxtfu",
    int:
      "account-resources-albloggingbucket-dd8beovglsas",
    prod:
      "account-resources-albloggingbucket-putdmiipqoj3"
  },
  "account-resources:AuditLoggingBucket": {
    dev:
      "arn:aws:s3:::ci-resources-auditloggingbucket-qinzx9hzgs2j",
    ref:
      "arn:aws:s3:::ci-resources-auditloggingbucket-t5w9ycwwsqsu",
    qa:
      "arn:aws:s3:::ci-resources-auditloggingbucket-172cr1kpwj6qo",
    int:
      "arn:aws:s3:::ci-resources-auditloggingbucket-1fuls8ilhv5wc",
    prod:
      "arn:aws:s3:::ci-resources-auditloggingbucket-xdzoeka33gt"
  },
  "account-resources:ClinicalTrackerCACertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerCACertSecret-rtrFoQIJ8IJg-XitBa8",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerCACertSecret-8QIZS4dk3QIC-UVcqcm",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerCACertSecret-2x5mFsIsw7qm-2fToN4",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerCACertSecret-2POqPo3KR5RU-QRUVkc",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerCACertSecret-0obi8Pinzeju-6p5JpZ"
  },
  "account-resources:ClinicalTrackerCAKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerCAKeySecret-wHPzhATMLvsr-vgtkDn",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerCAKeySecret-q8qfl6hg68rF-cFxvCb",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerCAKeySecret-l1YnphvDRPUh-yxMnTr",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerCAKeySecret-r2S2q7asLZSI-HcuxWP",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerCAKeySecret-OlrRpkQV37MC-Tc6ekp"
  },
  "account-resources:ClinicalTrackerClientCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerClientCertSe-AtyUFQyrxSkA-SG24xn",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerClientCertSe-apuFFEzDAkJU-TmoLl2",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerClientCertSe-aPwFSqB52bKm-epzma8",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerClientCertSe-E8a1XYbiVvNN-6SrZDD",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerClientCertSe-BytEPxFpIq1w-76oYUl"
  },
  "account-resources:ClinicalTrackerClientKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerClientKeySec-lNCHGTHQiCjy-OCJdhl",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerClientKeySec-PQbNhSvZn4ha-x3MwKn",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerClientKeySec-Q80vik4tDdpi-xIVFQi",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerClientKeySec-33OEFoNjnWoY-BcUJA7",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerClientKeySec-387jQWHi2Xuc-1iGWPr"
  },
  "account-resources:ClinicalTrackerClientSandboxCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerClientSandbo-35tNihaikWEJ-rJIW0C",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerClientSandbo-XXJDmjBte4SX-hXF4ZO",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerClientSandbo-JAw05mVg54l2-wkJ6lQ",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerClientSandbo-vA81XUPlPvQK-wD4pDO",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerClientSandbo-5zlzsxN6D6ec-u4fp0l"
  },
  "account-resources:ClinicalTrackerClientSandboxKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerClientSandbo-Sfx5Emmktdud-nnJxie",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerClientSandbo-GU0KFUHlKCYl-F9neeq",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerClientSandbo-VBY5gfVl5rqW-vdbDL1",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerClientSandbo-9nGNcnhR3cvo-3ZPt7g",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerClientSandbo-dUb7dZlv2TX5-61j0yN"
  },
  "account-resources:ClinicalTrackerProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-ClinicalTracker-ProxygenKid-zp3EIj",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-ClinicalTracker-ProxygenKid-UksYg0",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-ClinicalTracker-ProxygenKid-GXSxQp",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-ClinicalTracker-ProxygenKid-jMAktO",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-ClinicalTracker-ProxygenKid-zS7tSJ"
  },
  "account-resources:ClinicalTrackerProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:" +
      "account-resources-ClinicalTracker-ProxygenPrivateKey-ewO1RJ",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:" +
      "account-resources-ClinicalTracker-ProxygenPrivateKey-moiEiV",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:" +
      "account-resources-ClinicalTracker-ProxygenPrivateKey-cg4A2v",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:" +
      "account-resources-ClinicalTracker-ProxygenPrivateKey-yqYwRN",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:" +
      "account-resources-ClinicalTracker-ProxygenPrivateKey-IHisP9"
  },
  "account-resources:ClinicalTrackerProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerProxygen-kid-prod-g2NX7C",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerProxygen-kid-prod-nFxX49",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerProxygen-kid-prod-sE1DRf",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerProxygen-kid-prod-DCw6Pf",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerProxygen-kid-prod-b9nACV"
  },
  "account-resources:ClinicalTrackerProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerProxygen-PrivateKey-prod-HY7Sz4",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerProxygen-PrivateKey-prod-BpSnq1",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerProxygen-PrivateKey-prod-X5NKGq",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerProxygen-PrivateKey-prod-mXQ9rp",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerProxygen-PrivateKey-prod-OG1Cbe"
  },
  "account-resources:ClinicalTrackerProxygenPTLKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerProxygen-kid-ptl-aHAqor",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerProxygen-kid-ptl-CzOIG5",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerProxygen-kid-ptl-V3vfWU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerProxygen-kid-ptl-JYs2PJ",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerProxygen-kid-ptl-1rl2x4"
  },
  "account-resources:ClinicalTrackerProxygenPTLPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ClinicalTrackerProxygen-PrivateKey-ptl-nIPbFY",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ClinicalTrackerProxygen-PrivateKey-ptl-tz5o4A",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ClinicalTrackerProxygen-PrivateKey-ptl-m3GyjU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ClinicalTrackerProxygen-PrivateKey-ptl-7y1Vcc",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ClinicalTrackerProxygen-PrivateKey-ptl-KMbkxd"
  },
  "account-resources:ClinicalTrackerProxygenPublicKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-ClinicalTracker-ProxygenPublicKey-msrpaG",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-ClinicalTracker-ProxygenPublicKey-2UX0oG",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-ClinicalTracker-ProxygenPublicKey-VfCWOu",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-ClinicalTracker-ProxygenPublicKey-pwtSoL",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-ClinicalTracker-ProxygenPublicKey-b6hNzP"
  },
  "account-resources:CloudwatchEncryptionKMSPolicyArn": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-CloudwatchEncryptionKMSPolicy-he2GusLDT9Bq",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-CloudwatchEncryptionKMSPolicy-uGofPpESJSHQ",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-CloudwatchEncryptionKMSPolicy-bmczwuMeHwT7",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-CloudwatchEncryptionKMSPolicy-geUSBIbcr5Fu",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-CloudwatchEncryptionKMSPolicy-W8blQXNWEHRP"
  },
  "account-resources:CloudwatchLogsKmsKeyArn": {
    dev:
      "arn:aws:kms:eu-west-2:591291862413:key/27bd3d65-6112-42d0-8bdb-32dbf6258b9f",
    ref:
      "arn:aws:kms:eu-west-2:158471595810:key/7388e29e-267e-4de9-b2fc-d2004d04a387",
    qa:
      "arn:aws:kms:eu-west-2:394382261442:key/5762cc83-e3dc-4c87-bdd6-e4bbb60c158f",
    int:
      "arn:aws:kms:eu-west-2:399793560585:key/2f46d505-2dd1-4258-bcd1-d9c4e1d0f8be",
    prod:
      "arn:aws:kms:eu-west-2:434629240718:key/cac3d8a4-28bf-4e4c-8dbe-414d2bb14f1a"
  },
  "account-resources:CPSUProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-CPSU-ProxygenKid-Kg1w1d",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-CPSU-ProxygenKid-7aCMwo",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-CPSU-ProxygenKid-S99HUX",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-CPSU-ProxygenKid-0fCR51",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-CPSU-ProxygenKid-E0NvFn"
  },
  "account-resources:CPSUProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-CPSU-ProxygenPrivateKey-aqU35D",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-CPSU-ProxygenPrivateKey-i6qVWS",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-CPSU-ProxygenPrivateKey-eNHhIt",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-CPSU-ProxygenPrivateKey-SehGfK",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-CPSU-ProxygenPrivateKey-t69Kgd"
  },
  "account-resources:CPSUProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:CPSUProxygen-kid-prod-HuSA6R",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:CPSUProxygen-kid-prod-KqRAc3",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:CPSUProxygen-kid-prod-IOIhhi",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:CPSUProxygen-kid-prod-pGMJF6",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:CPSUProxygen-kid-prod-IayVyo"
  },
  "account-resources:CPSUProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:CPSUProxygen-PrivateKey-prod-P0DCKz",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:CPSUProxygen-PrivateKey-prod-y25k3l",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:CPSUProxygen-PrivateKey-prod-j5sFmq",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:CPSUProxygen-PrivateKey-prod-kqEagt",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:CPSUProxygen-PrivateKey-prod-6hYuFH"
  },
  "account-resources:CPSUProxygenPTLKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:CPSUProxygen-kid-ptl-E4Mnw8",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:CPSUProxygen-kid-ptl-wnzxbZ",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:CPSUProxygen-kid-ptl-XM5Z9M",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:CPSUProxygen-kid-ptl-Hg4mgX",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:CPSUProxygen-kid-ptl-jMiene"
  },
  "account-resources:CPSUProxygenPTLPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:CPSUProxygen-PrivateKey-ptl-RYbYgU",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:CPSUProxygen-PrivateKey-ptl-9sys0w",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:CPSUProxygen-PrivateKey-ptl-1fga33",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:CPSUProxygen-PrivateKey-ptl-YR1n7l",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:CPSUProxygen-PrivateKey-ptl-rI8a5d"
  },
  "account-resources:CPSUProxygenPublicKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-CPSU-ProxygenPublicKey-n9fuqu",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-CPSU-ProxygenPublicKey-pRdEuY",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-CPSU-ProxygenPublicKey-ivah5o",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-CPSU-ProxygenPublicKey-aV2BW7",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-CPSU-ProxygenPublicKey-tBBhBW"
  },
  "account-resources:FhirFacadeCACertSecret": {
    dev:
      // eslint-disable-next-line max-len
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeCACertSecret-o4LhTYhllcjS-9ElX1x", //gitleaks:allow
    ref:
      // eslint-disable-next-line max-len
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeCACertSecret-pT8Ke4kJu6yn-8AWrow", //gitleaks:allow
    qa:
      // eslint-disable-next-line max-len
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeCACertSecret-mVb5Gg0uhwch-JldhbV", //gitleaks:allow
    int:
      // eslint-disable-next-line max-len
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeCACertSecret-xWfhVvAwLbLZ-dOD2sW", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeCACertSecret-fq7iR6NqK8vk-ECPdjp" //gitleaks:allow
  },
  "account-resources:FhirFacadeCAKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeCAKeySecret-PFHmB1wIHQrN-JWTJHF", //gitleaks:allow
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeCAKeySecret-5FnGgM2ujokv-exnfgt", //gitleaks:allow
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeCAKeySecret-vaC81mYjqnno-Q9oxCL", //gitleaks:allow
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeCAKeySecret-eW9yeAxjHCjq-uujZQK", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeCAKeySecret-ndU08zMKAf2n-y55vc9" //gitleaks:allow
  },
  "account-resources:FhirFacadeClientCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeClientCertSecret-eaAlnGFEslLR-alFcuT",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeClientCertSecret-XmnJ8jrCvE0B-WFSAM3",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeClientCertSecret-S7TiyWmFXt6I-SAiyiZ",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeClientCertSecret-O9vzLf5z7q1k-R3BQ6j",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeClientCertSecret-rlCw7BvasCp1-W0Slv6"
  },
  "account-resources:FhirFacadeClientKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeClientKeySecret-gPXjIYN21Dyt-BjW7Wm",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeClientKeySecret-szqIFMqljQtH-qS5bGG",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeClientKeySecret-awQscoW2mLnp-JQGOwE",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeClientKeySecret-fVSIgvefSlgd-y73fgl",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeClientKeySecret-UXQjUEbfh3M7-Z06eqB"
  },
  "account-resources:FhirFacadeClientSandboxCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeClientSandboxCert-SupfNDIA4f3k-ofWW5P",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeClientSandboxCert-3cIBftoLRkBA-6Yj2pI",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeClientSandboxCert-Va9HI9YpO8KU-v5mnaL",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeClientSandboxCert-Mm8feb4JWT8I-K7YtNm",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeClientSandboxCert-n148Af48TpNy-7noIuh"
  },
  "account-resources:FhirFacadeClientSandboxKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirFacadeClientSandboxKeyS-FPXELWn1mhN2-2WKxLH",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirFacadeClientSandboxKeyS-KV2557UDv5wk-lSAL1E",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirFacadeClientSandboxKeyS-HCdBZl9G99Rt-2OQB34",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirFacadeClientSandboxKeyS-NWsJsIZ4c1fV-zKs7O9",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirFacadeClientSandboxKeyS-nnbM060yM5ep-P4eYc7"
  },
  "account-resources:LambdaAccessSecretsPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-LambdaAccessSecretsPolicy-cK7o7beJQAfC",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-LambdaAccessSecretsPolicy-j63KycbOKHR2",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-LambdaAccessSecretsPolicy-BHruUo9YLxTA",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-LambdaAccessSecretsPolicy-SEKdz0SgCKts",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-LambdaAccessSecretsPolicy-mlLNUD4KDcFP"
  },
  "account-resources:LambdaDecryptSecretsKMSPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-LambdaDecryptSecretsKMSPolicy-nF6OPLrVgXbb",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-LambdaDecryptSecretsKMSPolicy-FLVnjICxC3wm",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-LambdaDecryptSecretsKMSPolicy-BBmGM6bucU5o",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-LambdaDecryptSecretsKMSPolicy-sFTSaPOEaden",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-LambdaDecryptSecretsKMSPolicy-iUlKe6TEH8qE"
  },
  "account-resources:LambdaEncryptCloudwatchKMSPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-LambdaEncryptCloudwatchKMSPolicy-lWvo7ORuwHo6",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-LambdaEncryptCloudwatchKMSPolicy-F5v8xM3fLEca",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-LambdaEncryptCloudwatchKMSPolicy-Sy8VePKLB9LE",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-LambdaEncryptCloudwatchKMSPolicy-yl8So0EzD3s4",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-LambdaEncryptCloudwatchKMSPolicy-UNq69sXUZId4"
  },
  "account-resources:PfpCACertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PfpCACertSecret-RerW0oahQwB4-CEN0Kl", //gitleaks:allow
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PfpCACertSecret-3vMIkXSp2ntE-tZVvKR", //gitleaks:allow
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PfpCACertSecret-TbgxpvWXNy66-pyPuSW", //gitleaks:allow
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PfpCACertSecret-GLmoSE8KJkav-7EbD1l", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PfpCACertSecret-XbjW6nCOPcz0-l15tNF" //gitleaks:allow
  },
  "account-resources:PfpClientCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PfpClientCertSecret-OX1IZ0U6N6Ue-Z58Ya5",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PfpClientCertSecret-FxqPJAoztxXq-FCQLB9",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PfpClientCertSecret-fd5kp6afH0JX-eZzm4G",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PfpClientCertSecret-Ruo972ynk4wT-QHAlHS",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PfpClientCertSecret-5m0slbyTDIBo-pN7QBH"
  },
  "account-resources:PfpClientKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PfpClientKeySecret-FlrLupshj29L-2Euzsi",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PfpClientKeySecret-Q20gpSZhgAi9-wNnCSj",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PfpClientKeySecret-osPBgnjM4Qc9-YYK9UV",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PfpClientKeySecret-Ge8bQkJwPOoz-44kBDx",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PfpClientKeySecret-dz7j1UKcJwAG-CbEy6o"
  },
  "account-resources:PfpClientSandboxCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PfpClientSandboxCertSecret-MshhIdtbpMl3-2wdZGx",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PfpClientSandboxCertSecret-xKywP8IuquDR-B75nYp",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PfpClientSandboxCertSecret-D3rLW6ZRgNzR-pyPuSW",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PfpClientSandboxCertSecret-hTTllO0jAoid-KQ2WKq",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PfpClientSandboxCertSecret-93B71Ph4Ji8r-Q5WkGk"
  },
  "account-resources:PfpClientSandboxKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PfpClientSandboxKeySecret-wMx4pcdRghNp-SG24xn",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PfpClientSandboxKeySecret-xHviIMXLGNGw-3KHyVc",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PfpClientSandboxKeySecret-PmHoA3lfza9A-zE4Crf",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PfpClientSandboxKeySecret-Gdvkqr4OAUMa-25lh72",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PfpClientSandboxKeySecret-IygYGBZROU46-TiXBdX"
  },
  "account-resources:PsuCACertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuCACertSecret-GqHX5TQlBuCf-n4trZB", //gitleaks:allow
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuCACertSecret-A7ZsR0VMBqd8-9sXA3G", //gitleaks:allow
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuCACertSecret-cmClC1CaEdxn-QNdsdz", //gitleaks:allow
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuCACertSecret-JASjXe7PK9L4-bOIAwH", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuCACertSecret-m91dcxeWyidi-MrSAXV" //gitleaks:allow
  },
  "account-resources:PsuCAKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuCAKeySecret-OQp1juDN1Exq-QWSj31", //gitleaks:allow
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuCAKeySecret-lGDpWFzOmL9d-RrtCka", //gitleaks:allow
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuCAKeySecret-hY6wdpSBSJSg-XejmQh", //gitleaks:allow
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuCAKeySecret-ctGGDsssaozR-t4Laq1", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuCAKeySecret-IQsI3R5ZBpUa-9weLGO" //gitleaks:allow
  },
  "account-resources:PsuClientCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuClientCertSecret-U4Q3RFlXdIEx-7AkH0Q",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuClientCertSecret-OcpdLSSFooIi-32RGqY",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuClientCertSecret-FgS6LpomviPp-NCXAfY",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuClientCertSecret-RF22qAFf4J6g-a8dzA3",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuClientCertSecret-apYqnyQFFB1S-CX1yZw"
  },
  "account-resources:PsuClientKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuClientKeySecret-E5UtPEnvMWE3-yuWyAZ",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuClientKeySecret-cOOz9g7C9bkF-S6Zqcx",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuClientKeySecret-Li9252UUFb3m-6iV3nj",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuClientKeySecret-WpqL4KQ2p7GA-4NcOla",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuClientKeySecret-oP6phTe5GLNW-WPapv7"
  },
  "account-resources:PsuClientSandboxCertSecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuClientSandboxCertSecret-l4nFX9fmFYD4-RXGKE1",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuClientSandboxCertSecret-c726ZwwllDIB-MRFgoT",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuClientSandboxCertSecret-b8wPZtQPaYkI-q9BBOe",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuClientSandboxCertSecret-k5TZ2DwiNACL-Ms2631",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuClientSandboxCertSecret-OcOCvPxWpfrX-ONFDjB"
  },
  "account-resources:PsuClientSandboxKeySecret": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PsuClientSandboxKeySecret-tbt9UFbeBBDA-rC9ycy",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PsuClientSandboxKeySecret-LijxCqxV7gV6-5oEJME",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PsuClientSandboxKeySecret-uZZspOzfv560-EREPW3",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PsuClientSandboxKeySecret-839XhHpyV0K2-eFWVbO",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PsuClientSandboxKeySecret-2rsPDgSiqsyW-YgsXP3"
  },
  "account-resources:PSUProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-PSU-ProxygenKid-oBSaYn",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-PSU-ProxygenKid-tSO9ze",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-PSU-ProxygenKid-6O6uZk",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-PSU-ProxygenKid-J3or1X",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-PSU-ProxygenKid-aKgHyG"
  },
  "account-resources:PSUProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-PSU-ProxygenPrivateKey-90auij",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-PSU-ProxygenPrivateKey-ILsD1t",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-PSU-ProxygenPrivateKey-6kaKYM",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-PSU-ProxygenPrivateKey-JZJDuE",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-PSU-ProxygenPrivateKey-otq1pp"
  },
  "account-resources:PSUProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PSUProxygen-kid-prod-hJfa6F",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PSUProxygen-kid-prod-0FFv08",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PSUProxygen-kid-prod-VXDQ2m",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PSUProxygen-kid-prod-9ohvVB",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PSUProxygen-kid-prod-ppeuD5"
  },
  "account-resources:PSUProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PSUProxygen-PrivateKey-prod-BPM6aI",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PSUProxygen-PrivateKey-prod-vBakn8",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PSUProxygen-PrivateKey-prod-IOIhhi",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PSUProxygen-PrivateKey-prod-vdcDLw",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PSUProxygen-PrivateKey-prod-wnSTT2"
  },
  "account-resources:PSUProxygenPTLKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PSUProxygen-kid-ptl-SN5LS0",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PSUProxygen-kid-ptl-8PHZPy",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PSUProxygen-kid-ptl-m3GyjU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PSUProxygen-kid-ptl-85zqRt",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PSUProxygen-kid-ptl-zhcpWZ"
  },
  "account-resources:PSUProxygenPTLPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PSUProxygen-PrivateKey-ptl-AvV1AP",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PSUProxygen-PrivateKey-ptl-fZK87V",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PSUProxygen-PrivateKey-ptl-Z5M6dU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PSUProxygen-PrivateKey-ptl-jIIUyg",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PSUProxygen-PrivateKey-ptl-zRM3jT"
  },
  "account-resources:PSUProxygenPublicKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:account-resources-PSU-ProxygenPublicKey-nKIs2c",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:account-resources-PSU-ProxygenPublicKey-MPxVRv",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:account-resources-PSU-ProxygenPublicKey-e0pTuD",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:account-resources-PSU-ProxygenPublicKey-2sRJ0R",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:account-resources-PSU-ProxygenPublicKey-ZmmGHj"
  },
  "account-resources:SecretsKMSKeyAlias": {
    dev:
      "alias/SecretsKMSKeyAlias",
    ref:
      "alias/SecretsKMSKeyAlias",
    qa:
      "alias/SecretsKMSKeyAlias",
    int:
      "alias/SecretsKMSKeyAlias",
    prod:
      "alias/SecretsKMSKeyAlias"
  },
  "account-resources:ServiceSearchApiKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:ServiceSearchApiKey-L1Yz7eJVrEIe-R7D494",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:ServiceSearchApiKey-0UxJjamgAQYs-t8Eowl",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:ServiceSearchApiKey-Zs7o3MVIGRJG-JJMjsE",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:ServiceSearchApiKey-crcKn9ohTqwR-l1kEkw",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:ServiceSearchApiKey-TtpNiKjpPP5t-fhvN92"
  },
  "account-resources:SNSFeedbackLoggingRoleArn": {
    dev:
      "arn:aws:iam::591291862413:role/account-resources-SNSFeedbackLoggingRole-JU3IlNDbdZML",
    ref:
      "arn:aws:iam::158471595810:role/account-resources-SNSFeedbackLoggingRole-1nCslAVfvvuN",
    qa:
      "arn:aws:iam::394382261442:role/account-resources-SNSFeedbackLoggingRole-O0nPrAFvgKyV",
    int:
      "arn:aws:iam::399793560585:role/account-resources-SNSFeedbackLoggingRole-1nDYbbMRcIl7",
    prod:
      "arn:aws:iam::434629240718:role/account-resources-SNSFeedbackLoggingRole-0rF9VUHOBh33"
  },
  "account-resources:SnsKMSKey": {
    dev:
      "arn:aws:kms:eu-west-2:591291862413:key/25134734-2100-4f75-bf35-eb9c0ea74a5d",
    ref:
      "arn:aws:kms:eu-west-2:158471595810:key/c1f5ad70-1684-4ecc-bf2a-040dcdeb44f0",
    qa:
      "arn:aws:kms:eu-west-2:394382261442:key/ff38597c-24c7-4859-a300-0822429ec842",
    int:
      "arn:aws:kms:eu-west-2:399793560585:key/4dd24c16-f767-471d-b6c0-f30c30d6e8c6",
    prod:
      "arn:aws:kms:eu-west-2:434629240718:key/9d545c8c-1980-42dc-890f-b64e09f1b420"
  },
  "account-resources:SpineASID": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:SpineASID-aEADMaIseaBS-p5XYo2",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:SpineASID-ZVy4Vkpk9A3r-6bTDfj",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:SpineASID-177xxwXo5hMc-PJdCOK",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:SpineASID-KdRYEOuJa9SA-pmCBTv",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:SpineASID-2z6NhwyFLGAF-ysnsE8"
  },
  "account-resources:SpineCAChain": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:SpineCAChain-8wB0EFsRBYUM-dsPrHf",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:SpineCAChain-s6qWWABbqeaw-laZFaR",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:SpineCAChain-hKNXnEqDibqC-KgPSus",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:SpineCAChain-8esWhmtzcsvH-EOqfVr",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:SpineCAChain-Y6FJMwsd9qYJ-Sjf6YF"
  },
  "account-resources:SpinePartyKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:SpinePartyKey-vy4188Edeu7X-Ghbnq9",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:SpinePartyKey-xNeT5tyySCNB-aUqiTf",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:SpinePartyKey-ldG8XhRg9pRz-oVNAvU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:SpinePartyKey-pZoEVkpRE1a4-DCxDVy",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:SpinePartyKey-CRLj2UAmdewC-Wu1wQH"
  },
  "account-resources:SpinePrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:SpinePrivateKey-3bPxarwh2ouJ-YAl8Hj",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:SpinePrivateKey-EeyUc5rSmihR-6Dh326",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:SpinePrivateKey-sLGcYZccQfUu-rJPp6G",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:SpinePrivateKey-aqAcHvMHFoLG-U8nFsp",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:SpinePrivateKey-osDRJQV5fMv6-8oubLG"
  },
  "account-resources:SpinePublicCertificate": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:SpinePublicCertificate-Mt3qmTweyaIJ-ZwxcSb",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:SpinePublicCertificate-ny4HtwIW4Ros-WfYesW",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:SpinePublicCertificate-CbQtccqrK03w-iQRMWw",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:SpinePublicCertificate-wwyu58Alu7lZ-1aTpET",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:SpinePublicCertificate-yo29HQUGae15-06YABX"
  },
  "account-resources:SplunkDeliveryStreamBackupBucket": {
    dev:
      "arn:aws:s3:::ci-resources-splunkdeliverystreambackupbucket-moadbtfdist3",
    ref:
      "arn:aws:s3:::ci-resources-splunkdeliverystreambackupbucket-ef9ngo7tlpsn",
    qa:
      "arn:aws:s3:::ci-resources-splunkdeliverystreambackupbucket-1dqjc0fc9d9k5",
    int:
      "arn:aws:s3:::ci-resources-splunkdeliverystreambackupbucket-tktdzdskuzex",
    prod:
      "arn:aws:s3:::ci-resources-splunkdeliverystreambackupbucket-eqcc8r050a1o"
  },
  "account-resources:SplunkDeliveryStreamBackupBucketRole": {
    dev:
      "ci-resources-SplunkDeliveryStreamBackupBucketRole-16K41IGY3PBER",
    ref:
      "ci-resources-SplunkDeliveryStreamBackupBucketRole-R6WEIZKT8DSU",
    qa:
      "ci-resources-SplunkDeliveryStreamBackupBucketRole-QNK1EPLK4VM4",
    int:
      "ci-resources-SplunkDeliveryStreamBackupBucketRole-B5P28150Z82I",
    prod:
      "ci-resources-SplunkDeliveryStreamBackupBucketRole-1VZ65OCNASVOM"
  },
  "account-resources:SplunkDeliveryStreamBackupBucketRoleArn": {
    dev:
      "arn:aws:iam::591291862413:role/ci-resources-SplunkDeliveryStreamBackupBucketRole-16K41IGY3PBER",
    ref:
      "arn:aws:iam::158471595810:role/ci-resources-SplunkDeliveryStreamBackupBucketRole-R6WEIZKT8DSU",
    qa:
      "arn:aws:iam::394382261442:role/ci-resources-SplunkDeliveryStreamBackupBucketRole-QNK1EPLK4VM4",
    int:
      "arn:aws:iam::399793560585:role/ci-resources-SplunkDeliveryStreamBackupBucketRole-B5P28150Z82I",
    prod:
      "arn:aws:iam::434629240718:role/ci-resources-SplunkDeliveryStreamBackupBucketRole-1VZ65OCNASVOM"
  },
  "account-resources:SplunkDeliveryStreamBackupKMSKey": {
    dev:
      "arn:aws:kms:eu-west-2:591291862413:key/01c6d877-d492-4000-8145-1cb0b626565a",
    ref:
      "arn:aws:kms:eu-west-2:158471595810:key/57c62141-7a41-4ce7-afe5-bf1b4addfb82",
    qa:
      "arn:aws:kms:eu-west-2:394382261442:key/af6414de-0cdc-454a-83eb-c306e2a0e062",
    int:
      "arn:aws:kms:eu-west-2:399793560585:key/5750eeaa-de6d-47aa-aeb1-a8302c4fb198",
    prod:
      "arn:aws:kms:eu-west-2:434629240718:key/39fd1f88-44d4-4f37-bb3c-16317e66c872"
  },
  "account-resources:SqsDecryptSecretsKMSPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/account-resources-SqsDecryptSecretsKMSPolicy-okhhQebTVD8t",
    ref:
      "arn:aws:iam::158471595810:policy/account-resources-SqsDecryptSecretsKMSPolicy-jQHAzscY4xZT",
    qa:
      "arn:aws:iam::394382261442:policy/account-resources-SqsDecryptSecretsKMSPolicy-6BBnvZoiBD9P",
    int:
      "arn:aws:iam::399793560585:policy/account-resources-SqsDecryptSecretsKMSPolicy-apDUhCCNotdb",
    prod:
      "arn:aws:iam::434629240718:policy/account-resources-SqsDecryptSecretsKMSPolicy-LaDc82TxyaDu"
  },
  "account-resources:SqsKMSKey": {
    dev:
      "arn:aws:kms:eu-west-2:591291862413:key/de104dfd-1b9e-42d5-866e-e8a864250e53",
    ref:
      "arn:aws:kms:eu-west-2:158471595810:key/f8dc8947-b022-4af7-80d3-f75c58108962",
    qa:
      "arn:aws:kms:eu-west-2:394382261442:key/87521b8a-613f-421e-9460-d4c3a3806cb9",
    int:
      "arn:aws:kms:eu-west-2:399793560585:key/31bf99cc-56e3-4f23-94f4-57eb6856d510",
    prod:
      "arn:aws:kms:eu-west-2:434629240718:key/dad67093-ce3d-4ce2-bffa-1bdf7536c357"
  },
  "account-resources:TrustStoreBucket": {
    dev:
      "arn:aws:s3:::ci-resources-truststorebucket-1emm0xo65wil5",
    ref:
      "arn:aws:s3:::ci-resources-truststorebucket-1q9yub6qofamp",
    qa:
      "arn:aws:s3:::ci-resources-truststorebucket-qcoogm3bx7q8",
    int:
      "arn:aws:s3:::ci-resources-truststorebucket-lz9g6bkko6tj",
    prod:
      "arn:aws:s3:::ci-resources-truststorebucket-12enzhmcfaene"
  },
  "account-resources:TrustStoreBucketKMSKey": {
    dev:
      "arn:aws:kms:eu-west-2:591291862413:key/86bc22d8-391d-4597-b606-e366d1d4f069",
    ref:
      "arn:aws:kms:eu-west-2:158471595810:key/854405c3-bd0a-4952-b558-05ddef46847a",
    qa:
      "arn:aws:kms:eu-west-2:394382261442:key/7ce43a79-1a08-4906-91c1-53fd007cb237",
    int:
      "arn:aws:kms:eu-west-2:399793560585:key/9f53466d-e5d2-4d9e-938d-786db0a703c4",
    prod:
      "arn:aws:kms:eu-west-2:434629240718:key/aa7183fd-8726-4474-88fa-2dac545b6c9c"
  },
  "account-resources:TrustStoreDeploymentBucket": {
    dev:
      "arn:aws:s3:::account-resources-truststoredeploymentbucket-6nmypmgznh0l",
    ref:
      "arn:aws:s3:::account-resources-truststoredeploymentbucket-ifssqnmlpqh3",
    qa:
      "arn:aws:s3:::account-resources-truststoredeploymentbucket-x1jr1hejtx8e",
    int:
      "arn:aws:s3:::account-resources-truststoredeploymentbucket-lkpqwgrqixln",
    prod:
      "arn:aws:s3:::account-resources-truststoredeploymentbucket-w5ontxlwlwb8"
  },
  "ci-resources:AssistMeDocumentSyncRole": {
    dev:
      "arn:aws:iam::591291862413:role/ci-resources-AssistMeDocumentSyncRole-2tlvtK0jArXD",
    ref:
      "arn:aws:iam::158471595810:role/ci-resources-AssistMeDocumentSyncRole-kTP05Rhfr1rc",
    qa:
      "arn:aws:iam::394382261442:role/ci-resources-AssistMeDocumentSyncRole-60Y8lkaSJECy",
    int:
      "arn:aws:iam::399793560585:role/ci-resources-AssistMeDocumentSyncRole-ZnZzdnp062Li",
    prod:
      "arn:aws:iam::434629240718:role/ci-resources-AssistMeDocumentSyncRole-iO35AQAkq5T6"
  },
  "ci-resources:CloudFormationDeployRole": {
    dev:
      "arn:aws:iam::591291862413:role/ci-resources-CloudFormationDeployRole-1SQGXRGG0ZB5M",
    ref:
      "arn:aws:iam::158471595810:role/ci-resources-CloudFormationDeployRole-RQ4YZMTG4W44",
    qa:
      "arn:aws:iam::394382261442:role/ci-resources-CloudFormationDeployRole-B11LBXFDBR3U",
    int:
      "arn:aws:iam::399793560585:role/ci-resources-CloudFormationDeployRole-1JB10RY3ZS9A",
    prod:
      "arn:aws:iam::434629240718:role/ci-resources-CloudFormationDeployRole-RTPJGAG0XOT3"
  },
  "ci-resources:CloudFormationDeployRoleName": {
    dev:
      "ci-resources-CloudFormationDeployRole-1SQGXRGG0ZB5M",
    ref:
      "ci-resources-CloudFormationDeployRole-RQ4YZMTG4W44",
    qa:
      "ci-resources-CloudFormationDeployRole-B11LBXFDBR3U",
    int:
      "ci-resources-CloudFormationDeployRole-1JB10RY3ZS9A",
    prod:
      "ci-resources-CloudFormationDeployRole-RTPJGAG0XOT3"
  },
  "ci-resources:CloudFormationExecutionRole": {
    dev:
      "arn:aws:iam::591291862413:role/ci-resources-CloudFormationExecutionRole-1A9D0GXNWHPW2",
    ref:
      "arn:aws:iam::158471595810:role/ci-resources-CloudFormationExecutionRole-UIDA5F03HNM9",
    qa:
      "arn:aws:iam::394382261442:role/ci-resources-CloudFormationExecutionRole-S8N7SBFFTTCQ",
    int:
      "arn:aws:iam::399793560585:role/ci-resources-CloudFormationExecutionRole-19ARL2DHBBZOH",
    prod:
      "arn:aws:iam::434629240718:role/ci-resources-CloudFormationExecutionRole-9KOVMPLOBDN1"
  },
  "ci-resources:CloudFormationExecutionRoleName": {
    dev:
      "ci-resources-CloudFormationExecutionRole-1A9D0GXNWHPW2",
    ref:
      "ci-resources-CloudFormationExecutionRole-UIDA5F03HNM9",
    qa:
      "ci-resources-CloudFormationExecutionRole-S8N7SBFFTTCQ",
    int:
      "ci-resources-CloudFormationExecutionRole-19ARL2DHBBZOH",
    prod:
      "ci-resources-CloudFormationExecutionRole-9KOVMPLOBDN1"
  },
  "ci-resources:CloudFormationPrepareChangesetRole": {
    dev:
      "arn:aws:iam::591291862413:role/ci-resources-CloudFormationPrepareChangesetRole-8kLWGaJyV8IA",
    ref:
      "arn:aws:iam::158471595810:role/ci-resources-CloudFormationPrepareChangesetRole-ptV3gHWFetbr",
    qa:
      "arn:aws:iam::394382261442:role/ci-resources-CloudFormationPrepareChangesetRole-Iq1j9XLHY5mR",
    int:
      "arn:aws:iam::399793560585:role/ci-resources-CloudFormationPrepareChangesetRole-SZRUep10xjE5",
    prod:
      "arn:aws:iam::434629240718:role/ci-resources-CloudFormationPrepareChangesetRole-9x2RAGW1er04"
  },
  "ci-resources:CloudFormationPrepareChangesetRoleName": {
    dev:
      "ci-resources-CloudFormationPrepareChangesetRole-8kLWGaJyV8IA",
    ref:
      "ci-resources-CloudFormationPrepareChangesetRole-ptV3gHWFetbr",
    qa:
      "ci-resources-CloudFormationPrepareChangesetRole-Iq1j9XLHY5mR",
    int:
      "ci-resources-CloudFormationPrepareChangesetRole-SZRUep10xjE5",
    prod:
      "ci-resources-CloudFormationPrepareChangesetRole-9x2RAGW1er04"
  },
  "ci-resources:ProxygenProdRoleName": {
    dev:
      "ci-resources-ProxygenProdRole-mhoPkMuCLTsA",
    ref:
      "ci-resources-ProxygenProdRole-YvAJFz64PCDM",
    qa:
      "ci-resources-ProxygenProdRole-ltgMSbiOXXOu",
    int:
      "ci-resources-ProxygenProdRole-pgpNiPfoqaQb",
    prod:
      "ci-resources-ProxygenProdRole-lvqnBcKQJtNp"
  },
  "ci-resources:ProxygenPTLRoleName": {
    dev:
      "ci-resources-ProxygenPTLRole-A8SNZZbdyPT1",
    ref:
      "ci-resources-ProxygenPTLRole-QBmLAIlE05hX",
    qa:
      "ci-resources-ProxygenPTLRole-aR60h3dDDDL4",
    int:
      "ci-resources-ProxygenPTLRole-TPtEdUkDcNfd",
    prod:
      "ci-resources-ProxygenPTLRole-QrPkM4vFdW6B"
  },
  "lambda-resources:LambdaInsightsLogGroupPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/lambda-resources-LambdaInsightsLogGroupPolicy-w79nGUfpfrvo",
    ref:
      "arn:aws:iam::158471595810:policy/lambda-resources-LambdaInsightsLogGroupPolicy-pBGvPjH1mglW",
    qa:
      "arn:aws:iam::394382261442:policy/lambda-resources-LambdaInsightsLogGroupPolicy-nu0KUI5qF2yY",
    int:
      "arn:aws:iam::399793560585:policy/lambda-resources-LambdaInsightsLogGroupPolicy-RuJ3JCN8VjiC",
    prod:
      "arn:aws:iam::434629240718:policy/lambda-resources-LambdaInsightsLogGroupPolicy-vyCkpXtrhDv0"
  },
  "lambda-resources:SlackAlertsSnsTopicArn": {
    dev:
      "arn:aws:sns:eu-west-2:591291862413:lambda-resources-SlackAlerts",
    ref:
      "arn:aws:sns:eu-west-2:158471595810:lambda-resources-SlackAlerts",
    qa:
      "arn:aws:sns:eu-west-2:394382261442:lambda-resources-SlackAlerts",
    int:
      "arn:aws:sns:eu-west-2:399793560585:lambda-resources-SlackAlerts",
    prod:
      "arn:aws:sns:eu-west-2:434629240718:lambda-resources-SlackAlerts"
  },
  "lambda-resources:SplunkDeliveryStream": {
    dev:
      "arn:aws:firehose:eu-west-2:591291862413:deliverystream/lambda-resources-SplunkDeliveryStream-5NprAIo7hMSh",
    ref:
      "arn:aws:firehose:eu-west-2:158471595810:deliverystream/lambda-resources-SplunkDeliveryStream-ibdSIjUQmeG7",
    qa:
      "arn:aws:firehose:eu-west-2:394382261442:deliverystream/lambda-resources-SplunkDeliveryStream-q4LMYH9xF5VT",
    int:
      "arn:aws:firehose:eu-west-2:399793560585:deliverystream/lambda-resources-SplunkDeliveryStream-y0MR12T54Xhm",
    prod:
      "arn:aws:firehose:eu-west-2:434629240718:deliverystream/lambda-resources-SplunkDeliveryStream-LeOzeE6Tqtcw"
  },
  "lambda-resources:SplunkSubscriptionFilterRole": {
    dev:
      "arn:aws:iam::591291862413:role/lambda-resources-SplunkSubscriptionFilterRole-G1oJxlKN5aeJ",
    ref:
      "arn:aws:iam::158471595810:role/lambda-resources-SplunkSubscriptionFilterRole-mLS5VPyhj6kQ",
    qa:
      "arn:aws:iam::394382261442:role/lambda-resources-SplunkSubscriptionFilterRole-7kqyJbfNmEex",
    int:
      "arn:aws:iam::399793560585:role/lambda-resources-SplunkSubscriptionFilterRole-kowZoWWhyomF",
    prod:
      "arn:aws:iam::434629240718:role/lambda-resources-SplunkSubscriptionFilterRole-NpuN2xpD40Dq"
  },
  "secrets:DispensingProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirDispensingProxygen-kid-prod-qdHHo6",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirDispensingProxygen-kid-prod-MsWor2",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirDispensingProxygen-kid-prod-6HOeEU",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirDispensingProxygen-kid-prod-WMhHN9",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirDispensingProxygen-kid-prod-vUr6Xr"
  },
  "secrets:DispensingProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirDispensingProxygen-PrivateKey-prod-7OOUeC",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirDispensingProxygen-PrivateKey-prod-Fwi185",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirDispensingProxygen-PrivateKey-prod-H8ScJ7",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirDispensingProxygen-PrivateKey-prod-LMdz6j",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirDispensingProxygen-PrivateKey-prod-dOHaHE"
  },
  "secrets:DispensingProxygenPtlKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirDispensingProxygen-kid-ptl-cWONnW",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirDispensingProxygen-kid-ptl-3a7h8z",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirDispensingProxygen-kid-ptl-SebAPH",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirDispensingProxygen-kid-ptl-Z5dlfj",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirDispensingProxygen-kid-ptl-Dm0Bbh"
  },
  "secrets:DispensingProxygenPtlPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirDispensingProxygen-PrivateKey-ptl-eLrhxB",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirDispensingProxygen-PrivateKey-ptl-zyvMHg",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirDispensingProxygen-PrivateKey-ptl-rJPo6R",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirDispensingProxygen-PrivateKey-ptl-C7U6SN",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirDispensingProxygen-PrivateKey-ptl-e7POnw"
  },
  "secrets:epsSigningCertChain": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-epsSigningCertChain-wPesMr", //gitleaks:allow
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-epsSigningCertChain-2VVAcT", //gitleaks:allow
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-epsSigningCertChain-0dFfRR", //gitleaks:allow
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-epsSigningCertChain-CjVwJK", //gitleaks:allow
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-epsSigningCertChain-0426zz" //gitleaks:allow
  },
  "secrets:epsSigningCertChainManagedPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/secrets-epsSigningCertChainManagedPolicy-mTzxpCzMgYsm",
    ref:
      "arn:aws:iam::158471595810:policy/secrets-epsSigningCertChainManagedPolicy-rXchV98X7hVV",
    qa:
      "arn:aws:iam::394382261442:policy/secrets-epsSigningCertChainManagedPolicy-mJluaziElAjn",
    int:
      "arn:aws:iam::399793560585:policy/secrets-epsSigningCertChainManagedPolicy-WGilhwJ6iqrb",
    prod:
      "arn:aws:iam::434629240718:policy/secrets-epsSigningCertChainManagedPolicy-ULg7WGDcVQ5T"
  },
  "secrets:FhirDispensingProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-Dispensing-ProxygenKid-GFb0gA",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-Dispensing-ProxygenKid-n6Utnx",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-Dispensing-ProxygenKid-daq4Ah",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-Dispensing-ProxygenKid-SOHlhQ",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-Dispensing-ProxygenKid-1wqAcR"
  },
  "secrets:FhirDispensingProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-Dispensing-ProxygenPrivateKey-LRdnHD",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-Dispensing-ProxygenPrivateKey-Yx0AaN",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-Dispensing-ProxygenPrivateKey-pQYqCk",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-Dispensing-ProxygenPrivateKey-7FKJax",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-Dispensing-ProxygenPrivateKey-BHLPwc"
  },
  "secrets:FhirPrescribingProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-Prescribing-ProxygenKid-jhpexk",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-Prescribing-ProxygenKid-EnkGUZ",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-Prescribing-ProxygenKid-OanYXB",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-Prescribing-ProxygenKid-U4E1JY",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-Prescribing-ProxygenKid-yys8fH"
  },
  "secrets:FhirPrescribingProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-Prescribing-ProxygenPrivateKey-jcCcMO",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-Prescribing-ProxygenPrivateKey-M2xTYx",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-Prescribing-ProxygenPrivateKey-tYaENT",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-Prescribing-ProxygenPrivateKey-4nP6Io",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-Prescribing-ProxygenPrivateKey-uL7qff"
  },
  "secrets:PrescribingProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirPrescribingProxygen-kid-prod-l9oQ73",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirPrescribingProxygen-kid-prod-dTIRdg",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirPrescribingProxygen-kid-prod-4n69AK",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirPrescribingProxygen-kid-prod-avteYb",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirPrescribingProxygen-kid-prod-pbDrP3"
  },
  "secrets:PrescribingProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirPrescribingProxygen-PrivateKey-prod-DUh3RE",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirPrescribingProxygen-PrivateKey-prod-PkQ2NK",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirPrescribingProxygen-PrivateKey-prod-YfCzph",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirPrescribingProxygen-PrivateKey-prod-QMQGey",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirPrescribingProxygen-PrivateKey-prod-NTo0zp"
  },
  "secrets:PrescribingProxygenPtlKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirPrescribingProxygen-kid-ptl-UO01Cl",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirPrescribingProxygen-kid-ptl-sSlLjN",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirPrescribingProxygen-kid-ptl-idHVRj",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirPrescribingProxygen-kid-ptl-kMa9U9",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirPrescribingProxygen-kid-ptl-a6UBo0"
  },
  "secrets:PrescribingProxygenPtlPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:FhirPrescribingProxygen-PrivateKey-ptl-xfbtzA",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:FhirPrescribingProxygen-PrivateKey-ptl-Rykd0C",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:FhirPrescribingProxygen-PrivateKey-ptl-KixbwI",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:FhirPrescribingProxygen-PrivateKey-ptl-x6KxDY",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:FhirPrescribingProxygen-PrivateKey-ptl-qCFdPr"
  },
  "secrets:PrescriptionsForPatientsProxygenKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-PrescriptionsForPatients-ProxygenKid-UCE37M",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-PrescriptionsForPatients-ProxygenKid-TMNuym",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-PrescriptionsForPatients-ProxygenKid-pAqZvK",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-PrescriptionsForPatients-ProxygenKid-bbY2Sx",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-PrescriptionsForPatients-ProxygenKid-Z0jL2f"
  },
  "secrets:PrescriptionsForPatientsProxygenPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-PrescriptionsForPatients-ProxygenPrivateKey-n1OCua",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-PrescriptionsForPatients-ProxygenPrivateKey-94yPVT",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-PrescriptionsForPatients-ProxygenPrivateKey-bqWnBO",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-PrescriptionsForPatients-ProxygenPrivateKey-74e3P5",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-PrescriptionsForPatients-ProxygenPrivateKey-cqprKl"
  },
  "secrets:PrescriptionsForPatientsProxygenProdKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PrescriptionsForPatientsProxygen-kid-prod-njI4Nm",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PrescriptionsForPatientsProxygen-kid-prod-8Op0Xe",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PrescriptionsForPatientsProxygen-kid-prod-eeStvF",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PrescriptionsForPatientsProxygen-kid-prod-JwqNM1",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PrescriptionsForPatientsProxygen-kid-prod-pgvOKA"
  },
  "secrets:PrescriptionsForPatientsProxygenProdPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PrescriptionsForPatientsProxygen-PrivateKey-prod-UCE37M",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PrescriptionsForPatientsProxygen-PrivateKey-prod-Iznj05",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PrescriptionsForPatientsProxygen-PrivateKey-prod-ZaPX6E",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PrescriptionsForPatientsProxygen-PrivateKey-prod-zfIST3",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PrescriptionsForPatientsProxygen-PrivateKey-prod-JfbnT6"
  },
  "secrets:PrescriptionsForPatientsProxygenPtlKid": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PrescriptionsForPatientsProxygen-kid-ptl-P0BqVf",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PrescriptionsForPatientsProxygen-kid-ptl-qSOpNs",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PrescriptionsForPatientsProxygen-kid-ptl-wpgrXM",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PrescriptionsForPatientsProxygen-kid-ptl-EoexDr",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PrescriptionsForPatientsProxygen-kid-ptl-ZX0BPc"
  },
  "secrets:PrescriptionsForPatientsProxygenPtlPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:PrescriptionsForPatientsProxygen-PrivateKey-ptl-cWONnW",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:PrescriptionsForPatientsProxygen-PrivateKey-ptl-LjY5dY",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:PrescriptionsForPatientsProxygen-PrivateKey-ptl-KLioQn",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:PrescriptionsForPatientsProxygen-PrivateKey-ptl-lpw4DF",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:PrescriptionsForPatientsProxygen-PrivateKey-ptl-CGCoqh"
  },
  "secrets:ptlPrescriptionSigningPublicKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-ptlPrescriptionSigningPublicKey-LZ2ltO",
    ref:
      "arn:aws:secretsmanager:eu-west-2:158471595810:secret:secrets-ptlPrescriptionSigningPublicKey-piGdux",
    qa:
      "arn:aws:secretsmanager:eu-west-2:394382261442:secret:secrets-ptlPrescriptionSigningPublicKey-iw1GEL",
    int:
      "arn:aws:secretsmanager:eu-west-2:399793560585:secret:secrets-ptlPrescriptionSigningPublicKey-ehZky2",
    prod:
      "arn:aws:secretsmanager:eu-west-2:434629240718:secret:secrets-ptlPrescriptionSigningPublicKey-LsMLeu"
  },
  "secrets:ptlPrescriptionSigningPrivateKey": {
    dev:
      "arn:aws:secretsmanager:eu-west-2:591291862413:secret:secrets-ptlPrescriptionSigningPrivateKey-snav8w",
    ref:
      "<CHANGE ME>",
    qa:
      "<CHANGE ME>",
    int:
      "<CHANGE ME>",
    prod:
      "<CHANGE ME>"
  },
  "ci-resources:GitHubIdentityProvider": {
    dev:
      "arn:aws:iam::591291862413:oidc-provider/token.actions.githubusercontent.com",
    ref:
      "arn:aws:iam::158471595810:oidc-provider/token.actions.githubusercontent.com",
    qa:
      "arn:aws:iam::394382261442:oidc-provider/token.actions.githubusercontent.com",
    int:
      "arn:aws:iam::399793560585:oidc-provider/token.actions.githubusercontent.com",
    prod:
      "arn:aws:iam::434629240718:oidc-provider/token.actions.githubusercontent.com"
  },
  "ci-resources:GrantCloudFormationExecutionAccessIAMPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessIAMPolicy-gdiAGlPPXYVZ",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-GrantCloudFormationExecutionAccessIAMPolicy-OqARMtcrKaMp",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-GrantCloudFormationExecutionAccessIAMPolicy-APAXil4HZeNl",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-GrantCloudFormationExecutionAccessIAMPolicy-9uNdOePRUwH3",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-GrantCloudFormationExecutionAccessIAMPolicy-kqStD2Toh1bA"
  },
  "ci-resources:GrantCloudFormationExecutionAccessPolicyA": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyA-C69lLvBMqN5E",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyA-QV0IFg9cnMwp",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyA-MVANxQg0AGM1",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyA-cALdM1yXpnST",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyA-A0ucTOFkrgaJ"
  },
  "ci-resources:GrantCloudFormationExecutionAccessPolicyB": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyB-Yhazzqk3hi9H",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyB-DyPGT5dC7S3Q",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyB-4AwhNCWeGSX5",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyB-E8pxfC2lwRA7",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyB-tQDFjvYhb05i"
  },
  "ci-resources:GrantCloudFormationExecutionAccessPolicyC": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyC-B5O11HpNZ1dl",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyC-tOVtqoI80qFf",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyC-D1Mq3y2Ax2tH",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyC-zgouHqCnlYB",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyC-VUfsijftBFL4"
  },
  "ci-resources:GrantCloudFormationExecutionAccessPolicyD": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyD-ol9LS7VJsCG4",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyD-VhPO4Z9f63zS",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyD-Pc2ZLALZDvv0",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyD-SL1jeqv0qMxR",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyD-8ZmTkGtQ0hyL"
  },
  "ci-resources:GrantCloudFormationExecutionAccessPolicyE": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-GrantCloudFormationExecutionAccessPolicyE-l4fZxSSj5UYn",
    ref:
      "not_created_yet",
    qa:
      "not_created_yet",
    int:
      "not_created_yet",
    prod:
      "not_created_yet"
  },
  "ci-resources:AllowCloudFormationSecretsAccessManagedPolicy": {
    dev:
      "arn:aws:iam::591291862413:policy/ci-resources-AllowCloudFormationSecretsAccessManagedPolicy-9hMFLJpwl0zr",
    ref:
      "arn:aws:iam::158471595810:policy/ci-resources-AllowCloudFormationSecretsAccessManagedPolicy-gmuQxPPYKNXF",
    qa:
      "arn:aws:iam::394382261442:policy/ci-resources-AllowCloudFormationSecretsAccessManagedPolicy-lQ4GxVZKTvXZ",
    int:
      "arn:aws:iam::399793560585:policy/ci-resources-AllowCloudFormationSecretsAccessManagedPolicy-UOnk2KV2NgxM",
    prod:
      "arn:aws:iam::434629240718:policy/ci-resources-AllowCloudFormationSecretsAccessManagedPolicy-gSySdnRavQEO"
  }
}

export function
getExportValue(exportName: string, environment: string): string {
  const exportValue = exportValues[exportName]
  if (!exportValue) {
    throw new Error(`Export with name ${exportName} not found`)
  }
  const value = exportValue[environment as keyof typeof exportValue]
  if (!value) {
    throw new Error(`Export with name ${exportName} not found for environment ${environment}`)
  }
  return value
}
