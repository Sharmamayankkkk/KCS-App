# Security Policy

## Known Vulnerabilities

### xlsx Package

**Status:** Accepted Risk  
**Package:** xlsx@0.18.5  
**Severity:** High

#### Vulnerabilities:
1. **Prototype Pollution (GHSA-4r6h-8v6p-xvw6)**
   - CVSS: 7.8 (High)
   - Vector: AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H
   - Requires: Local access with user interaction

2. **ReDoS (GHSA-5pgg-2g8v-p4x9)**
   - CVSS: 7.5 (High)
   - Vector: AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H

#### Justification:
- The xlsx library is used for admin-only attendance export functionality
- Admins already have privileged access to the data being exported
- The vulnerability requires either local file access or specific malicious input patterns
- No fix is currently available from the package maintainer
- The feature is essential for administrative workflows

#### Mitigation:
- Restrict attendance export feature to verified admin users only
- Input validation is performed on all data before export
- Regular monitoring for package updates

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@krishnaconsciousnesssociety.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will respond within 48 hours.
