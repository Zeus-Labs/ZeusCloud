<p align="center">
  <h1 align="center">IronCloud: Cloud Security</h1>
  <p align="center">
    <em>Secure your cloud.</em>
  </p>
</p>

<div align="center">


[![Prs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](http://makeapullrequest.com)
[![Join Slack](https://img.shields.io/badge/slack%20community-join-blue)](https://join.slack.com/t/ironleapcommunity/shared_invite/zt-1oxm8asmq-4oyM4fdqarSHMoMstGH6Lw)
[![License](https://img.shields.io/badge/license-Apache2.0-brightgreen)](/LICENSE)


</div>

## IronCloud is an open-source cloud security platform that helps teams prioritize and remediate the risks they have in their cloud. 

- Seamlessly connect and scan your AWS accounts
- Customize security and compliance controls most important for your AWS environment 
- Full transparency over what is protected in the cloud
- Contextually prioritize and remediate security findings
- Ensure compliance standards are met with PCI DSS, CIS, and more!

## Table of Contents

- [Get started for free](#get-started-for-free)
- [Features](#features)
- [Contributing](#contributing)
- [Why IronCloud](#why-ironcloud)
- [Future Roadmap](#future-roadmap)

## Get started for free

Insert how to use dockerfile and instructions on how to use.

## Features

Place demo here.


* **Configurability** - Configure which cloud controls are active, which risks should be muted, and more
* **Security as Code** - Easily customize security controls
with extensible security as code
* **Fast Prioritization** - Filter, sort, and fast search
to zoom in on the the most important risks
* **Compliance** - Ensure your cloud posture is compliant with PCI DSS, CIS benchmarks and more!


## Why IronCloud?
Cloud usage continues to grow. Companies are shifting more of their workloads from on-prem to the cloud and both adding and expanding new and existing workloads in the cloud. Cloud providers keep increasing their offerings and their complexity. Companies are having trouble keeping track of their security risks as their cloud environment scales and grows more complex. Several high profile attacks have occurred in recent times. Capital One had an S3 bucket breached, Amazon had an unprotected Prime Video server breached, Microsoft had an Azure DevOps server breached, Puma was the victim of ransomware, etc.

We had to take action.

- We noticed traditional cloud security tools are opaque, confusing, time consuming to set up, and expensive as you scale your cloud environment
- Cybersecurity vendors don't provide much actionable information to security, engineering, and devops teams by inundating them with non-contextual alerts
- IronCloud is easy to set up, transparent, and configurable, so you can prioritize the most important risks 
- Best of all, you can use **IronCloud for free**!

## Future Roadmap
- Faster self-deployment for multiple AWS accounts
- Adding controls around Identity and Access Management
- Automating periodic scans in your AWS environment

## Contributing
We love contributions of all sizes. What would be most helpful first: 

- Please give us feedback in our Slack (insert slack link).
- Open a PR (see our instructions on developing IronCloud locally)
- Submit a feature request or bug report


### Clone Repo

1. Clone repo with the cartography submodules.
```
git clone --recurse-submodules git@github.com:IronLeap/IronCloud.git
```

#### Production version

1. Generate encryption key and set the ENCRYPTION_KEY environment variable in .env
```
openssl rand -base64 32
```

2. Run containers
```
docker-compose down && docker-compose pull && docker-compose up 
```

1. Visit frontend at http:localhost:3000


#### Development version

1. Run containers
```
docker-compose down && docker-compose -f docker-compose.dev.yaml --env-file .env.dev up --build
```

2. Visit frontend at http:localhost:3000

3. If you want to reset neo4j and/or postgres data
```
rm -rf .compose/neo4j
rm -rf .compose/postgres
```

4. If you want to develop on frontend, make the the code changes and save.

5. If you want to develop on backend, run
```
docker-compose -f docker-compose.dev.yaml --env-file .env.dev up --no-deps --build backend
```

