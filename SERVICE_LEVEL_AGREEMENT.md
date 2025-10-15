# Service Level Agreement (SLA) - FlowTracker Library Management System

**Effective Date:** January 2025  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Introduction and Agreement](#1-introduction-and-agreement)
2. [Definitions](#2-definitions)
3. [Service Description](#3-service-description)
4. [Service Availability and Uptime](#4-service-availability-and-uptime)
5. [Performance Standards](#5-performance-standards)
6. [Support Services](#6-support-services)
7. [Maintenance Windows](#7-maintenance-windows)
8. [Security and Data Protection](#8-security-and-data-protection)
9. [Incident Management](#9-incident-management)
10. [Service Credits and Remedies](#10-service-credits-and-remedies)
11. [Customer Responsibilities](#11-customer-responsibilities)
12. [Monitoring and Reporting](#12-monitoring-and-reporting)
13. [Changes and Updates](#13-changes-and-updates)
14. [Service Tiers](#14-service-tiers)
15. [Exclusions and Limitations](#15-exclusions-and-limitations)
16. [Dispute Resolution](#16-dispute-resolution)
17. [Contact Information](#17-contact-information)

---

## 1. Introduction and Agreement

### 1.1 Purpose
This Service Level Agreement ("SLA") defines the service commitments, performance standards, and support levels that FlowTracker ("we," "us," "our," or "Service Provider") provides to its customers ("you," "your," or "Customer") for the FlowTracker library management system ("Service").

### 1.2 Scope
This SLA applies to:
- All FlowTracker subscription customers
- All service tiers (Essential, Professional, Enterprise)
- Core Service functionality as described in Section 3
- Support services as described in Section 6

### 1.3 Agreement Structure
This SLA is incorporated by reference into and forms part of:
- Your FlowTracker subscription agreement
- The FlowTracker Terms of Service
- Any other applicable agreement between you and FlowTracker

### 1.4 SLA Modifications
We may modify this SLA with:
- **30 days' written notice** for changes that reduce service commitments
- **Immediate effect** for changes that improve service commitments
- Notice provided via email and in-app notifications

### 1.5 Binding Nature
By continuing to use the Service after receiving notice of SLA modifications, you accept the revised terms. If you do not accept modifications that reduce service commitments, you may terminate your subscription in accordance with your agreement.

### 1.6 Governing Documents
In case of conflict between this SLA and other agreements:
1. Executed Enterprise Agreement (highest precedence)
2. This Service Level Agreement
3. Terms of Service
4. Privacy Policy

---

## 2. Definitions

**Business Hours:** 9:00 AM to 5:00 PM Australian Eastern Standard/Daylight Time (AEST/AEDT), Monday through Friday, excluding Australian public holidays.

**Critical Issue:** A problem that causes complete Service unavailability or data loss, preventing all users from accessing core functionality.

**Customer:** Any organization or entity that has entered into a subscription agreement for FlowTracker services.

**Downtime:** Any period when the Service is unavailable to Customer due to Service Provider fault, excluding Scheduled Maintenance and Excused Downtime.

**Emergency Maintenance:** Unscheduled maintenance required to address Critical Issues, security vulnerabilities, or prevent imminent Service failure.

**Excused Downtime:** Service unavailability due to circumstances beyond Service Provider's reasonable control, including Force Majeure events, Customer actions, or third-party failures (see Section 15.1).

**High Priority Issue:** A problem that significantly impacts Service functionality, affecting multiple users but with workaround solutions available.

**Incident:** Any event that causes or may cause Service disruption, degradation, or unavailability.

**Low Priority Issue:** A minor problem or cosmetic issue that does not significantly impact Service functionality.

**Medium Priority Issue:** A problem that impacts Service functionality for some users but does not prevent core operations.

**Monthly Uptime Percentage:** Calculated as: (Total Minutes in Month - Downtime Minutes) / Total Minutes in Month × 100%

**Response Time:** The time between Customer reporting an issue through approved channels and our initial acknowledgment.

**Resolution Time:** The time between initial incident acknowledgment and full restoration of Service functionality or provision of acceptable workaround.

**Scheduled Maintenance:** Planned Service maintenance communicated to Customers in advance according to Section 7.

**Service:** The FlowTracker library management system, including web application, API, database, and supporting infrastructure.

**Service Credit:** A credit applied to Customer's future subscription fees as compensation for failure to meet SLA commitments.

**Uptime:** The time period when the Service is available and functioning according to specifications.

---

## 3. Service Description

### 3.1 Core Service Components
This SLA applies to the following core Service components:

#### 3.1.1 Web Application
- User interface accessible via web browser
- Kanban board functionality for issue tracking
- User authentication and authorization
- Dashboard and reporting features
- Settings and configuration management

#### 3.1.2 API Services
- RESTful API endpoints for all core functions
- Authentication and authorization services
- Data retrieval and manipulation operations
- Integration capabilities with third-party systems

#### 3.1.3 Database Services
- Data storage and retrieval
- Multi-tenant data isolation
- Backup and recovery capabilities
- Data integrity and consistency

#### 3.1.4 Email Services
- Transactional email delivery (notifications, password resets)
- System-generated communications
- Email verification services

#### 3.1.5 File Storage
- Secure file upload and storage
- Attachment management for issues
- File retrieval and download capabilities

### 3.2 Included Features
All service tiers include:
- Issue creation, tracking, and management
- Multi-user collaboration
- Collection management
- Status workflow management
- User roles and permissions
- Basic reporting and analytics
- Email notifications
- Data export capabilities
- Mobile-responsive interface

### 3.3 Service Boundaries
This SLA covers the core Service platform but does not extend to:
- Third-party integrations (separate SLAs may apply)
- Customer's internal network or internet connectivity
- Customer's hardware or devices
- ILS systems or other external systems
- Customization or professional services (unless separately contracted)

---

## 4. Service Availability and Uptime

### 4.1 Uptime Commitment

#### 4.1.1 Service Tier Commitments

**Essential Tier:**
- **Target Uptime:** 99.5% per calendar month
- **Maximum Downtime:** Approximately 3 hours and 36 minutes per month
- **Measurement Period:** Calendar month
- **Excludes:** Scheduled Maintenance and Excused Downtime

**Professional Tier:**
- **Target Uptime:** 99.9% per calendar month
- **Maximum Downtime:** Approximately 43 minutes per month
- **Measurement Period:** Calendar month
- **Excludes:** Scheduled Maintenance and Excused Downtime

**Enterprise Tier:**
- **Target Uptime:** 99.95% per calendar month
- **Maximum Downtime:** Approximately 22 minutes per month
- **Measurement Period:** Calendar month
- **Excludes:** Scheduled Maintenance and Excused Downtime
- **Additional:** 24/7 monitoring and support

### 4.2 Uptime Calculation Methodology

#### 4.2.1 Measurement
Monthly Uptime Percentage is calculated as:

```
Monthly Uptime % = ((Total Monthly Minutes - Downtime Minutes) / Total Monthly Minutes) × 100
```

#### 4.2.2 Downtime Determination
Downtime begins when:
- We receive notification of Service unavailability through our monitoring systems, OR
- You report Service unavailability through approved support channels (whichever occurs first)

Downtime ends when:
- Service functionality is restored and confirmed through our monitoring systems, AND
- The issue is verified as resolved by our technical team

#### 4.2.3 Partial Outages
If Service is only partially unavailable:
- **Affecting <10% of users:** Not counted as Downtime
- **Affecting 10-50% of users:** Counted as 50% Downtime
- **Affecting >50% of users:** Counted as 100% Downtime

### 4.3 Exclusions from Downtime Calculation
The following are excluded from Downtime calculations:

#### 4.3.1 Scheduled Maintenance
- Maintenance windows as described in Section 7
- Properly notified and scheduled in advance
- Occurring during approved maintenance windows

#### 4.3.2 Excused Downtime
- Force Majeure events (see Section 15.1)
- Customer-caused issues (see Section 15.2)
- Internet or DNS provider failures beyond our control
- Third-party service failures (unless Service Provider's primary vendor)
- DDoS attacks or other malicious activities
- Customer's failure to meet system requirements

#### 4.3.3 Emergency Maintenance
- Critical security patches required within 24 hours
- Emergency fixes to prevent data loss or corruption
- Immediate response to Critical Issues
- When advance notice is not reasonably possible

**Note:** We will minimize Emergency Maintenance and provide notice as soon as practicable.

### 4.4 Availability Reporting
We provide uptime reports:
- **Monthly:** Summary of uptime performance sent by 5th of following month
- **Quarterly:** Detailed availability analysis for Enterprise customers
- **Real-Time:** Status page available at status.flowtracker.com.au (to be established)
- **Historical:** 12 months of historical uptime data available on request

---

## 5. Performance Standards

### 5.1 Response Time Commitments

#### 5.1.1 Page Load Times
**Target Performance (measured at server):**
- **Initial Page Load:** <2 seconds (95th percentile)
- **Subsequent Page Loads:** <1 second (95th percentile)
- **API Response Time:** <500ms (95th percentile)
- **Search Queries:** <1 second (95th percentile)

**Note:** Times measured from our servers to network edge. Actual user experience may vary based on internet connection, geographic location, and device performance.

#### 5.1.2 Database Operations
- **Standard Queries:** <200ms (95th percentile)
- **Complex Reports:** <5 seconds (95th percentile)
- **Data Export:** <30 seconds for standard datasets (up to 10,000 records)

#### 5.1.3 File Operations
- **File Upload:** Support for files up to 50MB (Essential/Professional), 100MB (Enterprise)
- **Upload Processing:** <30 seconds for files under 10MB
- **File Download:** Initiated within 2 seconds

### 5.2 Scalability and Capacity

#### 5.2.1 Concurrent Users
- **Essential Tier:** Up to 25 concurrent users
- **Professional Tier:** Up to 100 concurrent users
- **Enterprise Tier:** Up to 500 concurrent users (higher limits by arrangement)

#### 5.2.2 Data Storage
- **Essential Tier:** 10GB included, additional storage available
- **Professional Tier:** 50GB included, additional storage available
- **Enterprise Tier:** 200GB included, unlimited by arrangement

#### 5.2.3 Transaction Volumes
- **Issue Operations:** Up to 10,000 issue operations per hour per tenant
- **API Calls:** Rate limits as specified in API documentation
- **Batch Operations:** Support for bulk operations up to 1,000 records

### 5.3 Browser and Device Support

#### 5.3.1 Supported Browsers (Current and Previous Version)
- **Fully Supported:**
  - Google Chrome
  - Mozilla Firefox
  - Microsoft Edge (Chromium-based)
  - Safari (macOS and iOS)

- **Basic Support:**
  - Other Chromium-based browsers
  - Mobile browsers on Android and iOS

#### 5.3.2 Device Support
- **Desktop:** Windows, macOS, Linux
- **Tablets:** iPad, Android tablets
- **Mobile:** iPhone, Android phones (responsive design)

#### 5.3.3 Screen Resolutions
- Optimized for resolutions from 320px (mobile) to 4K displays
- Responsive design adapts to all screen sizes

### 5.4 API Performance

#### 5.4.1 API Availability
- API availability matches Service tier uptime commitments
- API endpoints monitored independently for performance

#### 5.4.2 API Rate Limits
- **Essential Tier:** 1,000 requests per hour per API key
- **Professional Tier:** 5,000 requests per hour per API key
- **Enterprise Tier:** 20,000 requests per hour per API key (higher limits by arrangement)

#### 5.4.3 API Response Times
- **95th Percentile:** <500ms
- **99th Percentile:** <2 seconds
- Measured from API gateway to response completion

---

## 6. Support Services

### 6.1 Support Channels

#### 6.1.1 Available Channels
- **Email Support:** support@flowtracker.com.au
- **Help Center:** Online knowledge base and documentation
- **Support Portal:** Web-based ticket submission and tracking
- **Phone Support:** Available for Professional and Enterprise tiers (number provided upon subscription)
- **Live Chat:** Available during Business Hours for Professional and Enterprise tiers
- **Dedicated Account Manager:** Enterprise tier only

#### 6.1.2 Support Languages
- Primary: English
- Documentation: English
- Additional language support may be available by arrangement

### 6.2 Support Hours and Response Times

#### 6.2.1 Essential Tier
**Support Hours:**
- **Email/Portal:** 24/7 submission, responses during Business Hours
- **Response Times:**
  - Critical Issues: 4 business hours
  - High Priority: 8 business hours
  - Medium Priority: 2 business days
  - Low Priority: 5 business days

**Channels:**
- Email support
- Help Center access
- Support portal

#### 6.2.2 Professional Tier
**Support Hours:**
- **Email/Portal:** 24/7 submission, responses during extended hours (7 AM - 9 PM AEST/AEDT, Monday-Friday)
- **Phone/Chat:** Business Hours
- **Response Times:**
  - Critical Issues: 2 business hours (phone callback within 1 hour)
  - High Priority: 4 business hours
  - Medium Priority: 1 business day
  - Low Priority: 3 business days

**Channels:**
- Priority email support
- Phone support
- Live chat support
- Help Center access
- Support portal

#### 6.2.3 Enterprise Tier
**Support Hours:**
- **Email/Portal/Phone:** 24/7/365
- **Dedicated Account Manager:** Business Hours
- **Response Times:**
  - Critical Issues: 1 hour, 24/7 (immediate phone contact for production-down situations)
  - High Priority: 2 business hours
  - Medium Priority: 4 business hours
  - Low Priority: 1 business day

**Channels:**
- Dedicated support email
- 24/7 phone support with priority queue
- Live chat support
- Dedicated Account Manager
- Quarterly Business Reviews
- Help Center access
- Priority support portal

### 6.3 Issue Priority Definitions

#### 6.3.1 Critical (Priority 1)
**Definition:**
- Complete Service unavailability affecting all users
- Critical functionality completely non-operational
- Data loss or corruption
- Security breach or vulnerability actively being exploited

**Examples:**
- Service is completely down
- Database unavailable
- Authentication system failure preventing all logins
- Data breach in progress

**Response:**
- Immediate acknowledgment and assignment to senior engineers
- Continuous work until resolution
- Regular status updates every hour
- Executive escalation as needed

#### 6.3.2 High Priority (Priority 2)
**Definition:**
- Major functionality significantly impaired
- Affecting multiple users or entire organization
- Workaround may be available but impractical
- Performance severely degraded

**Examples:**
- Key features not working (e.g., issue creation, status updates)
- API endpoints returning errors
- Major performance degradation affecting productivity
- Integration failures with critical systems

**Response:**
- Priority assignment to experienced support engineers
- Work during extended support hours
- Status updates every 4 hours until resolution
- Escalation path clearly defined

#### 6.3.3 Medium Priority (Priority 3)
**Definition:**
- Partial functionality impaired
- Affecting some users but workaround available
- Non-critical features not working
- Moderate performance issues

**Examples:**
- Specific report not generating correctly
- Minor UI issues affecting usability
- Some users experiencing intermittent issues
- Non-critical integration issues

**Response:**
- Assignment to support engineers during Business Hours
- Resolution within defined timeframes
- Status updates upon request or when significant progress made

#### 6.3.4 Low Priority (Priority 4)
**Definition:**
- Minor issues or cosmetic problems
- Feature requests or enhancements
- General questions or guidance needed
- Documentation errors

**Examples:**
- UI display inconsistencies
- Enhancement suggestions
- General how-to questions
- Typos in documentation

**Response:**
- Addressed during normal support operations
- May be batched with other maintenance activities
- Updates provided as resolved or scheduled

### 6.4 Resolution Time Targets

#### 6.4.1 Essential Tier
- Critical: 12 business hours
- High Priority: 2 business days
- Medium Priority: 5 business days
- Low Priority: 10 business days

#### 6.4.2 Professional Tier
- Critical: 8 business hours
- High Priority: 1 business day
- Medium Priority: 3 business days
- Low Priority: 7 business days

#### 6.4.3 Enterprise Tier
- Critical: 4 hours (target for production-down situations)
- High Priority: 8 business hours
- Medium Priority: 2 business days
- Low Priority: 5 business days

**Note:** These are target resolution times. Actual resolution may vary based on issue complexity. We commit to providing regular updates and working diligently toward resolution.

### 6.5 Escalation Procedures

#### 6.5.1 Automatic Escalation
Issues are automatically escalated when:
- Response time commitment is missed
- Resolution time target will be exceeded
- Customer dissatisfaction is indicated
- Critical issue remains unresolved beyond 4 hours (Enterprise) or 12 hours (Professional)

#### 6.5.2 Customer-Initiated Escalation
Customers may request escalation:
- **Professional Tier:** To Support Manager
- **Enterprise Tier:** To Account Manager or Support Director
- **Contact:** escalation@flowtracker.com.au

#### 6.5.3 Escalation Response
- **Acknowledgment:** Within 30 minutes during support hours
- **Review:** Senior engineer or manager assigned
- **Communication:** Escalation contact provided
- **Updates:** Increased frequency of status updates

---

## 7. Maintenance Windows

### 7.1 Scheduled Maintenance

#### 7.1.1 Standard Maintenance Windows
**Essential and Professional Tiers:**
- **When:** Sundays, 2:00 AM - 6:00 AM AEST/AEDT
- **Frequency:** Up to twice per month
- **Notice:** At least 7 days in advance via email and in-app notification
- **Duration:** Maximum 4 hours per window

**Enterprise Tier:**
- **When:** Negotiated maintenance windows
- **Frequency:** Up to once per month during standard window
- **Notice:** At least 14 days in advance via email and account manager
- **Duration:** Maximum 2 hours per window
- **Alternative:** Maintenance can be scheduled outside standard windows by arrangement

#### 7.1.2 Maintenance Notification
Scheduled maintenance notifications include:
- **Date and Time:** Specific start and expected end times
- **Impact:** Expected Service availability during maintenance
- **Affected Features:** Specific functionality that may be unavailable
- **Contact:** Support contact for questions or concerns

#### 7.1.3 Maintenance Activities
Scheduled maintenance may include:
- Software updates and feature deployments
- Security patches and updates
- Database optimization and maintenance
- Infrastructure upgrades
- Performance improvements

### 7.2 Emergency Maintenance

#### 7.2.1 Definition
Emergency maintenance is unscheduled maintenance required to:
- Address Critical security vulnerabilities
- Prevent imminent Service failure or data loss
- Respond to active security threats
- Restore Service after unexpected outages

#### 7.2.2 Notification
For emergency maintenance:
- **Notice:** As soon as reasonably possible (may be during or after maintenance)
- **Communication:** Email, in-app notification, and status page
- **Updates:** Regular updates during extended emergency maintenance
- **Post-Incident:** Detailed incident report provided (Enterprise tier)

#### 7.2.3 Duration
- Emergency maintenance kept to minimum necessary duration
- Service restoration prioritized over feature perfection
- Follow-up maintenance may be scheduled if needed

### 7.3 Maintenance Best Practices
We strive to:
- Minimize maintenance frequency and duration
- Schedule maintenance during lowest usage periods
- Complete most updates without Service disruption (zero-downtime deployments when possible)
- Test thoroughly before production deployment
- Provide rollback capabilities for quick recovery

---

## 8. Security and Data Protection

### 8.1 Security Commitments

#### 8.1.1 Data Security Measures
We implement and maintain:
- **Encryption:** TLS 1.3+ for data in transit; AES-256 for data at rest
- **Access Controls:** Role-based access control (RBAC) and principle of least privilege
- **Authentication:** Strong password requirements; multi-factor authentication available
- **Network Security:** Firewalls, intrusion detection, and DDoS protection
- **Monitoring:** 24/7 security monitoring and logging

#### 8.1.2 Application Security
- Input validation and sanitization
- Protection against OWASP Top 10 vulnerabilities
- Regular security testing and code reviews
- Secure development lifecycle practices
- Third-party security audits (annually for Enterprise tier)

#### 8.1.3 Infrastructure Security
- Secure cloud hosting with certified providers
- Network segmentation and isolation
- Regular security patches and updates
- Vulnerability scanning and penetration testing
- Physical security at data centers (through hosting provider)

### 8.2 Data Protection

#### 8.2.1 Data Backup
**Backup Schedule:**
- **Full Backups:** Daily, retained for 30 days
- **Incremental Backups:** Every 4 hours, retained for 7 days
- **Transaction Logs:** Continuous, retained for 7 days

**Backup Storage:**
- Geographically distributed across multiple data centers
- Encrypted using AES-256
- Regularly tested for recoverability

**Backup Testing:**
- Monthly backup restoration tests
- Quarterly disaster recovery drills
- Annual comprehensive disaster recovery exercise

#### 8.2.2 Data Recovery
**Recovery Point Objective (RPO):**
- **Essential Tier:** 4 hours (maximum data loss in disaster scenario)
- **Professional Tier:** 1 hour
- **Enterprise Tier:** 15 minutes (with point-in-time recovery)

**Recovery Time Objective (RTO):**
- **Essential Tier:** 8 hours (target time to restore Service)
- **Professional Tier:** 4 hours
- **Enterprise Tier:** 2 hours

#### 8.2.3 Data Retention
- Active customer data retained for duration of subscription
- Deleted data retained for 30 days for recovery purposes
- Backups retained according to backup schedule
- Compliance with legal retention requirements (7 years for financial data)

### 8.3 Compliance and Certifications

#### 8.3.1 Current Compliance
- **Privacy Act 1988 (Cth):** Australian Privacy Principles compliance
- **PCI DSS:** Compliance through certified payment processors
- **GDPR:** Compliance for European customers

#### 8.3.2 Planned Certifications
- **ISO 27001:** Information Security Management (in progress)
- **SOC 2 Type II:** Service organization controls (in progress)
- **Australian Government ISM:** For government sector customers (planned)

### 8.4 Security Incident Response

#### 8.4.1 Incident Detection
- 24/7 security monitoring and alerting
- Automated anomaly detection
- User-reported security concerns

#### 8.4.2 Incident Response Process
1. **Detection and Analysis:** Identify and assess security incident
2. **Containment:** Limit spread and impact
3. **Eradication:** Remove threat and vulnerabilities
4. **Recovery:** Restore normal operations
5. **Post-Incident:** Review and implement improvements

#### 8.4.3 Customer Notification
In the event of a security incident affecting customer data:
- **Notification Timing:** As soon as practicable after assessment (within 72 hours for GDPR-applicable breaches)
- **Content:** Nature of incident, data affected, actions taken, recommended customer actions
- **Method:** Email to primary contact and account administrators

---

## 9. Incident Management

### 9.1 Incident Lifecycle

#### 9.1.1 Detection
Incidents may be detected through:
- Automated monitoring and alerting systems
- Customer reports through support channels
- Internal team observations
- Third-party notifications

#### 9.1.2 Classification
All incidents are classified by:
- **Severity:** Critical, High, Medium, Low (as defined in Section 6.3)
- **Impact:** Number of users affected
- **Scope:** Specific features or entire Service
- **Urgency:** Time sensitivity of resolution

#### 9.1.3 Response
Initial response includes:
- Acknowledgment to reporting party
- Assignment to appropriate support tier
- Preliminary impact assessment
- Communication to affected customers (for Critical incidents)

#### 9.1.4 Investigation
Investigation process:
- Root cause analysis
- Impact assessment and scope determination
- Identification of workarounds or temporary solutions
- Development of resolution plan

#### 9.1.5 Resolution
Resolution activities:
- Implementation of fix or workaround
- Testing and verification
- Deployment to production
- Confirmation with affected customers

#### 9.1.6 Communication
Throughout incident lifecycle:
- Initial acknowledgment
- Regular status updates based on severity
- Resolution notification
- Post-incident review (for Critical and High Priority incidents)

### 9.2 Communication During Incidents

#### 9.2.1 Status Page
Real-time service status available at: status.flowtracker.com.au (to be established)
- Current operational status
- Scheduled maintenance notices
- Active incident updates
- Historical incident data

#### 9.2.2 Incident Updates
**Critical Incidents:**
- Initial update within 1 hour
- Updates every hour until resolution
- Estimated resolution time provided when available

**High Priority Incidents:**
- Initial update within 2 hours
- Updates every 4 hours until resolution

**Medium/Low Priority:**
- Updates upon request or significant progress

#### 9.2.3 Communication Channels
- Email notifications to affected customers
- Status page updates
- In-app notifications (when Service is accessible)
- Social media updates for major incidents (optional)

### 9.3 Post-Incident Review

#### 9.3.1 Critical Incident Reviews
For all Critical incidents, we conduct a thorough post-incident review:
- **Timeline:** Complete within 5 business days of resolution
- **Content:**
  - Incident timeline and root cause analysis
  - Impact assessment
  - Actions taken during incident
  - Lessons learned
  - Preventive measures implemented
  - Follow-up actions and timeline
- **Distribution:** Provided to Enterprise customers; available to others upon request

#### 9.3.2 Continuous Improvement
Post-incident findings are used to:
- Update processes and procedures
- Improve monitoring and alerting
- Enhance documentation
- Train support staff
- Prevent similar incidents

---

## 10. Service Credits and Remedies

### 10.1 Service Credit Eligibility

#### 10.1.1 Qualifying Events
Service Credits are available when:
- Monthly Uptime Percentage falls below SLA commitment
- Critical incident response time exceeds SLA commitment by more than 100%
- Scheduled maintenance exceeds maximum duration by more than 50%

#### 10.1.2 Calculation Period
- Service Credits calculated on calendar month basis
- Must be claimed within 30 days of end of affected month
- Cannot be claimed for months with no subscription fees paid

### 10.2 Service Credit Amounts

#### 10.2.1 Uptime-Based Credits
**Essential Tier (99.5% commitment):**
- 99.0% - 99.49% uptime: 10% of monthly fee
- 98.0% - 98.99% uptime: 25% of monthly fee
- <98.0% uptime: 50% of monthly fee

**Professional Tier (99.9% commitment):**
- 99.5% - 99.89% uptime: 10% of monthly fee
- 99.0% - 99.49% uptime: 25% of monthly fee
- 95.0% - 98.99% uptime: 50% of monthly fee
- <95.0% uptime: 100% of monthly fee

**Enterprise Tier (99.95% commitment):**
- 99.9% - 99.94% uptime: 10% of monthly fee
- 99.5% - 99.89% uptime: 25% of monthly fee
- 99.0% - 99.49% uptime: 50% of monthly fee
- <99.0% uptime: 100% of monthly fee

#### 10.2.2 Maximum Monthly Credit
- Maximum Service Credit per month: 100% of monthly subscription fee
- Credits do not apply to one-time fees, professional services, or additional usage charges

### 10.3 Claiming Service Credits

#### 10.3.1 Claim Process
To claim Service Credits, you must:
1. **Submit Claim:** Email billing@flowtracker.com.au within 30 days of month end
2. **Include:**
   - Account information and customer ID
   - Month for which credit is claimed
   - Specific dates/times of downtime or SLA violation
   - Nature of issue experienced
3. **Validation:** We will validate claim against monitoring data
4. **Approval:** Approved credits applied to next monthly invoice

#### 10.3.2 Credit Application
- Credits applied to future subscription fees only
- Credits cannot be redeemed for cash
- Credits expire if account is terminated
- Credits applied before other discounts or promotions

### 10.4 Limitations

#### 10.4.1 Service Credits are Sole Remedy
Service Credits represent your sole and exclusive remedy for:
- Failure to meet uptime commitments
- Service unavailability or degradation
- SLA violations

To the extent permitted by law, Service Credits are in lieu of all other remedies, whether at law or in equity.

#### 10.4.2 Australian Consumer Law
Nothing in this SLA excludes, restricts, or modifies rights you may have under the Australian Consumer Law or other legislation that cannot be lawfully excluded, restricted, or modified.

---

## 11. Customer Responsibilities

### 11.1 Account Management

#### 11.1.1 Account Security
You are responsible for:
- Maintaining confidentiality of account credentials
- Implementing strong password policies for your users
- Enabling multi-factor authentication where available
- Promptly reporting suspected security breaches
- Managing user access and permissions appropriately

#### 11.1.2 Account Information
- Maintain accurate contact information
- Designate appropriate account administrators
- Update billing information as needed
- Promptly notify us of organizational changes

### 11.2 Acceptable Use

#### 11.2.1 Compliance
You must:
- Use the Service in compliance with applicable laws and regulations
- Comply with FlowTracker Terms of Service and Acceptable Use Policy
- Respect intellectual property rights
- Not use the Service for illegal or harmful purposes

#### 11.2.2 Resource Usage
You agree to:
- Use the Service within subscribed tier limits
- Not attempt to circumvent usage limits or restrictions
- Not overload or attempt to disrupt the Service
- Notify us if you anticipate exceeding normal usage patterns

### 11.3 Data Management

#### 11.3.1 Data Responsibility
You are responsible for:
- Accuracy and legality of data you upload
- Obtaining necessary consents for personal information
- Maintaining local backups of critical data (recommended)
- Regular data review and cleanup

#### 11.3.2 Data Rights
You must:
- Have necessary rights to data you upload
- Not upload confidential third-party information without authorization
- Comply with data protection laws applicable to your organization
- Respond appropriately to data subject requests

### 11.4 Technical Requirements

#### 11.4.1 Infrastructure
You are responsible for:
- Internet connectivity and adequate bandwidth
- Compatible devices and browsers (as specified in Section 5.3)
- Local network configuration and security
- End-user device management and security

#### 11.4.2 Integration Support
For third-party integrations:
- Maintain valid credentials for integrated systems
- Ensure integrated systems meet technical requirements
- Troubleshoot issues on your systems before escalating to us
- Provide necessary access for troubleshooting

### 11.5 Communication and Reporting

#### 11.5.1 Issue Reporting
To ensure effective support:
- Report issues through approved support channels
- Provide detailed information about issues (steps to reproduce, error messages, affected users)
- Respond promptly to requests for additional information
- Test and confirm resolution when issues are addressed

#### 11.5.2 Emergency Contact
- Maintain current emergency contact information
- Designate backup contacts for critical communications
- Ensure contacts are available during business hours
- Respond promptly to critical security notifications

### 11.6 Prohibited Activities
You must not:
- Attempt to reverse engineer or decompile the Service
- Use the Service to store or transmit malicious code
- Interfere with other customers' use of the Service
- Access parts of the Service not authorized for your account
- Scrape or harvest data from the Service
- Use the Service to send spam or unsolicited communications

---

## 12. Monitoring and Reporting

### 12.1 Service Monitoring

#### 12.1.1 Internal Monitoring
We monitor Service health through:
- **Uptime Monitoring:** Synthetic transaction testing every 60 seconds from multiple global locations
- **Performance Monitoring:** Real-time tracking of response times, error rates, and throughput
- **Infrastructure Monitoring:** Server health, database performance, network connectivity
- **Security Monitoring:** Intrusion detection, anomaly detection, access logging
- **User Experience Monitoring:** Real user monitoring for actual user experience

#### 12.1.2 Monitoring Tools
- Automated monitoring and alerting systems
- Log aggregation and analysis
- Application performance management (APM)
- Database performance monitoring
- Network and infrastructure monitoring

#### 12.1.3 Alerting
- 24/7 on-call engineering team
- Automated escalation for critical alerts
- Multiple redundant alerting channels
- Defined alert thresholds and response procedures

### 12.2 Reporting to Customers

#### 12.2.1 Standard Reports
Available to all customers:
- **Monthly Uptime Report:** Delivered by 5th of following month
  - Overall uptime percentage
  - Downtime incidents and durations
  - Scheduled maintenance summary
  - Service Credit eligibility (if applicable)

- **Status Page:** Real-time service status
  - Current operational status
  - Active incidents
  - Scheduled maintenance
  - 90-day uptime history

#### 12.2.2 Professional Tier Reports
In addition to standard reports:
- **Quarterly Performance Report:**
  - Detailed uptime and performance metrics
  - Support ticket statistics
  - Feature usage analytics
  - Comparison to SLA commitments

#### 12.2.3 Enterprise Tier Reports
In addition to Professional reports:
- **Monthly Executive Summary:**
  - Service performance highlights
  - Support activity summary
  - Upcoming features and maintenance
  - Account health check

- **Quarterly Business Review:**
  - In-person or video conference review with Account Manager
  - Comprehensive service performance analysis
  - Strategic planning and optimization recommendations
  - Q&A and feedback session

- **Custom Reports:**
  - Available upon request
  - Can be tailored to specific requirements
  - Integration with customer's reporting systems

### 12.3 Transparency and Communication

#### 12.3.1 Status Page
Our public status page (status.flowtracker.com.au) provides:
- Real-time operational status for all Service components
- Incident history and updates
- Scheduled maintenance calendar
- Historical uptime data (90 days)
- RSS/Atom feed and email subscription options

#### 12.3.2 Incident Communication
During incidents, we provide:
- Initial acknowledgment and impact assessment
- Regular updates based on incident severity
- Estimated resolution time (when available)
- Resolution notification
- Post-incident summary (for Critical incidents)

#### 12.3.3 Maintenance Communication
For scheduled maintenance:
- Advance notice via email and in-app notification
- Posted on status page
- Reminders 48 hours and 24 hours before maintenance
- Start and completion notifications

### 12.4 Customer Monitoring

#### 12.4.1 API Access
Customers can monitor their own usage through:
- API endpoint health checks
- Programmatic access to status information
- Webhook notifications for status changes (Enterprise tier)

#### 12.4.2 Dashboard Analytics
In-app analytics available to all customers:
- User activity and engagement metrics
- Issue tracking statistics
- System usage trends
- Performance metrics for your instance

---

## 13. Changes and Updates

### 13.1 Service Improvements

#### 13.1.1 Feature Updates
We continuously improve the Service through:
- **Minor Updates:** Bug fixes and small improvements deployed regularly
- **Feature Releases:** New features and enhancements released monthly
- **Major Versions:** Significant architectural updates released as needed

#### 13.1.2 Update Communication
- **Minor Updates:** No advance notice required; documented in change log
- **Feature Releases:** Announced via email and in-app notifications; documented in release notes
- **Major Versions:** 30 days' advance notice; comprehensive documentation and training provided

#### 13.1.3 Breaking Changes
For changes that may impact existing functionality:
- **90 days' advance notice** for Enterprise customers
- **60 days' advance notice** for Professional customers
- **30 days' advance notice** for Essential customers
- Migration guides and support provided
- Deprecation warnings in affected features

### 13.2 SLA Modifications

#### 13.2.1 Improvement Modifications
Changes that improve SLA commitments:
- Take effect immediately upon notification
- Communicated via email and posted to website
- No customer action required

#### 13.2.2 Reduction Modifications
Changes that reduce SLA commitments:
- **30 days' advance notice** via email to primary account contact
- Posted to website and status page
- You may terminate subscription without penalty during notice period if you do not accept changes

#### 13.2.3 Customer Objection
If you object to SLA modifications:
- Contact your Account Manager (Enterprise) or support@flowtracker.com.au (other tiers)
- We will work with you to address concerns
- You may terminate subscription in accordance with your agreement if resolution cannot be reached

### 13.3 Service Tier Changes

#### 13.3.1 Voluntary Upgrades
You may upgrade your service tier at any time:
- Upgraded features available immediately
- Pro-rated billing adjustment
- No service interruption

#### 13.3.2 Voluntary Downgrades
You may downgrade your service tier:
- Effective at end of current billing period
- 30 days' notice recommended
- Data and features adjusted to new tier limitations

#### 13.3.3 Involuntary Changes
We may change your service tier if:
- Usage consistently exceeds tier limits (upgrade required)
- Payment failures occur (downgrade or suspension)
- Terms of Service violations (suspension or termination)

### 13.4 Technology Updates

#### 13.4.1 Browser and System Requirements
We may update supported browsers and systems:
- 90 days' notice before dropping support for specific versions
- Continued support for current and previous major versions
- Migration guidance for affected customers

#### 13.4.2 API Versioning
- API versions maintained for at least 12 months after deprecation announcement
- New API versions introduced without breaking existing versions
- Comprehensive migration documentation provided

---

## 14. Service Tiers

### 14.1 Essential Tier

#### 14.1.1 Target Customers
- Small libraries (single location)
- Up to 25 users
- Basic issue tracking needs

#### 14.1.2 Service Commitments
- **Uptime:** 99.5% monthly
- **Support Hours:** Business Hours
- **Response Times:** Standard (see Section 6.2.1)
- **Maintenance Windows:** Up to twice per month
- **Data Storage:** 10GB included

#### 14.1.3 Support Features
- Email support
- Help Center access
- Community forum access
- Standard documentation

#### 14.1.4 Limitations
- No phone or chat support
- No dedicated Account Manager
- Standard API rate limits
- No customization or white-labeling
- Standard backup and recovery (4-hour RPO, 8-hour RTO)

### 14.2 Professional Tier

#### 14.2.1 Target Customers
- Medium-sized libraries (multiple locations)
- Up to 100 users
- Advanced feature requirements

#### 14.2.2 Service Commitments
- **Uptime:** 99.9% monthly
- **Support Hours:** Extended Hours (7 AM - 9 PM AEST/AEDT, Monday-Friday)
- **Response Times:** Priority (see Section 6.2.2)
- **Maintenance Windows:** Up to twice per month (may be scheduled outside standard windows)
- **Data Storage:** 50GB included

#### 14.2.3 Support Features
- Priority email support
- Phone support during support hours
- Live chat support during business hours
- Quarterly performance reports
- Advanced documentation and training materials

#### 14.2.4 Enhanced Features
- Higher API rate limits
- Advanced reporting and analytics
- Custom workflow configurations
- Integration support for major ILS systems
- Improved backup and recovery (1-hour RPO, 4-hour RTO)

### 14.3 Enterprise Tier

#### 14.3.1 Target Customers
- Large library systems (many locations)
- Over 100 users
- Mission-critical operations requiring highest reliability

#### 14.3.2 Service Commitments
- **Uptime:** 99.95% monthly
- **Support Hours:** 24/7/365
- **Response Times:** Premium (see Section 6.2.3)
- **Maintenance Windows:** Negotiable (minimal impact)
- **Data Storage:** 200GB included (unlimited by arrangement)

#### 14.3.3 Support Features
- Dedicated Account Manager
- 24/7 priority phone support
- Live chat support
- Quarterly Business Reviews
- Custom reporting
- Proactive monitoring and optimization
- Escalation to senior engineers
- Post-incident reviews for all Critical incidents

#### 14.3.4 Premium Features
- Custom SLA negotiation
- Dedicated infrastructure options
- White-labeling and custom branding
- Advanced security features
- Custom integrations and API development
- Training and onboarding support
- Strategic planning assistance
- Point-in-time recovery (15-minute RPO, 2-hour RTO)

#### 14.3.5 Optional Add-Ons
- Dedicated hosting environment
- Advanced analytics and BI integration
- Custom development services
- Extended data retention
- Geo-redundancy options
- Professional services and consulting

### 14.4 Tier Comparison Summary

| Feature | Essential | Professional | Enterprise |
|---------|-----------|--------------|------------|
| **Uptime SLA** | 99.5% | 99.9% | 99.95% |
| **Support Hours** | Business Hours | Extended Hours | 24/7/365 |
| **Critical Response** | 4 hours | 2 hours | 1 hour |
| **Phone Support** | ✗ | ✓ | ✓ (Priority) |
| **Chat Support** | ✗ | ✓ | ✓ |
| **Account Manager** | ✗ | ✗ | ✓ |
| **Users Included** | Up to 25 | Up to 100 | Up to 500+ |
| **Storage** | 10GB | 50GB | 200GB+ |
| **API Rate Limit** | 1K/hour | 5K/hour | 20K+/hour |
| **RPO** | 4 hours | 1 hour | 15 minutes |
| **RTO** | 8 hours | 4 hours | 2 hours |
| **Custom SLA** | ✗ | ✗ | ✓ |
| **Dedicated Infrastructure** | ✗ | ✗ | Optional |

---

## 15. Exclusions and Limitations

### 15.1 Force Majeure

#### 15.1.1 Definition
Force Majeure events are circumstances beyond our reasonable control, including:
- **Natural Disasters:** Earthquakes, floods, fires, storms, tsunamis
- **Government Actions:** Laws, regulations, orders, embargoes, sanctions
- **Wars and Terrorism:** Armed conflict, terrorism, civil unrest, riots
- **Infrastructure Failures:** Internet backbone failures, power grid failures, telecommunications outages
- **Cyber Attacks:** DDoS attacks, coordinated hacking campaigns
- **Pandemics:** Widespread disease outbreaks affecting operations
- **Labor Actions:** Strikes, lockouts, labor disputes beyond our control

#### 15.1.2 Effect
During Force Majeure events:
- SLA commitments are suspended for duration of event
- We will make reasonable efforts to minimize impact
- Service Credits do not apply for affected period
- We will communicate with customers about impact and expected duration

#### 15.1.3 Notification
We will notify customers of Force Majeure events:
- As soon as reasonably practical
- Through status page, email, and in-app notifications
- With updates on restoration progress
- With post-event summary

### 15.2 Customer-Caused Issues

#### 15.2.1 Customer Actions
Downtime or performance issues caused by you are excluded from SLA, including:
- Misconfiguration of integrations or settings
- Excessive API usage or abuse
- Uploading malicious content or files
- Disabling security features
- Providing incorrect information

#### 15.2.2 Customer Infrastructure
Issues with your infrastructure are excluded:
- Internet connectivity problems
- Local network issues
- Firewall or security software blocking access
- Device or browser incompatibility
- Insufficient bandwidth

#### 15.2.3 Customer Integrations
Problems with third-party systems you integrate:
- ILS system failures or downtime
- SSO provider issues
- Third-party API failures
- Custom integration errors

### 15.3 Third-Party Service Failures

#### 15.3.1 Outside Our Control
Failures of third-party services are excluded when:
- Multiple alternative providers would experience same failure
- Failure is widespread and industry-acknowledged
- Provider is industry-standard service (e.g., AWS region outages)

#### 15.3.2 Within Our Control
We remain responsible for:
- Selecting reliable third-party providers
- Implementing redundancy where reasonably possible
- Migrating to alternative providers when feasible
- Minimizing impact through architectural decisions

### 15.4 Beta and Experimental Features

#### 15.4.1 Exclusion
SLA commitments do not apply to:
- Features labeled as "Beta," "Alpha," or "Experimental"
- Preview features not generally available
- Features explicitly marked as not covered by SLA

#### 15.4.2 Disclosure
Beta features are clearly marked:
- In product interface
- In documentation
- In release notes
- With disclaimer about SLA exclusion

#### 15.4.3 Transition
When Beta features become generally available:
- SLA coverage begins on general availability date
- Customers notified of status change
- Features stabilized and fully supported

### 15.5 Scheduled Maintenance

#### 15.5.1 Proper Notification
Scheduled maintenance with proper notice is excluded from Downtime:
- Notification provided according to Section 7
- Occurring within approved maintenance windows
- Completed within maximum duration

#### 15.5.2 Extended Maintenance
If scheduled maintenance exceeds maximum duration by more than 50%:
- Service Credit may apply (see Section 10.2.1)
- We will work to complete maintenance as quickly as possible
- Post-incident review conducted

### 15.6 Security Measures

#### 15.6.1 Protective Actions
SLA does not apply to unavailability caused by:
- Blocking malicious traffic or DDoS attacks
- Implementing emergency security measures
- Responding to active security incidents
- Rate limiting or blocking abusive access

#### 15.6.2 Our Commitment
We will:
- Implement protections that minimize impact on legitimate users
- Restore normal access as quickly as possible
- Communicate with affected customers
- Review incidents to improve future response

### 15.7 Measurement Disputes

#### 15.7.1 Our Monitoring
- SLA measurements based on our monitoring systems
- Multiple monitoring locations used for accuracy
- Industry-standard monitoring tools and practices
- Monitoring data retained for 90 days

#### 15.7.2 Customer Monitoring
- Customer monitoring may differ due to various factors
- We will investigate discrepancies in good faith
- Our monitoring data is authoritative for SLA purposes
- Significant discrepancies may indicate customer infrastructure issues

---

## 16. Dispute Resolution

### 16.1 Informal Resolution

#### 16.1.1 First Contact
For any concerns regarding this SLA:
1. **Contact Support:** support@flowtracker.com.au (Essential/Professional) or your Account Manager (Enterprise)
2. **Describe Issue:** Provide specific details about SLA concern
3. **Desired Outcome:** Explain what you believe is appropriate resolution
4. **Timeframe:** We will respond within 2 business days

#### 16.1.2 Escalation
If initial contact does not resolve the concern:
- **Professional Tier:** Escalate to Support Manager (escalation@flowtracker.com.au)
- **Enterprise Tier:** Escalate to VP of Customer Success
- **Response:** Within 1 business day
- **Resolution Attempt:** Within 5 business days

### 16.2 Formal Dispute Resolution

#### 16.2.1 Mediation
If informal resolution fails:
- Either party may request mediation
- Conducted by mutually agreed mediator or through recognised mediation service
- Cost shared equally between parties
- Good faith participation required

#### 16.2.2 Arbitration
If mediation does not resolve dispute:
- Arbitration conducted under Australian Centre for International Commercial Arbitration (ACICA) rules
- Single arbitrator unless parties agree otherwise
- Location: Sydney, Australia (or mutually agreed location)
- Language: English

#### 16.2.3 Legal Action
As a last resort:
- Proceedings in appropriate Australian courts
- Governed by laws of Australia
- Forum non conveniens provisions may apply

### 16.3 Governing Law

#### 16.3.1 Australian Law
This SLA is governed by:
- Commonwealth of Australia laws
- State laws where applicable
- Australian Consumer Law provisions

#### 16.3.2 Jurisdiction
- Non-exclusive jurisdiction of Australian courts
- Parties submit to jurisdiction for enforcement purposes

### 16.4 Australian Consumer Law Protections

Nothing in this SLA excludes, restricts, or modifies:
- Consumer guarantees under Australian Consumer Law
- Rights that cannot be excluded by law
- Liability for death or personal injury caused by negligence
- Liability for fraud or fraudulent misrepresentation

---

## 17. Contact Information

### 17.1 Support Contacts

#### 17.1.1 General Support
**Essential and Professional Tiers:**
- **Email:** support@flowtracker.com.au
- **Phone:** [Phone number to be inserted] (Professional tier only)
- **Support Portal:** [URL to be inserted]
- **Hours:** As specified in your service tier (Section 6.2)

**Enterprise Tier:**
- **Dedicated Email:** [Custom email provided upon subscription]
- **24/7 Phone:** [Dedicated number provided upon subscription]
- **Account Manager:** [Contact provided upon subscription]

#### 17.1.2 Emergency Support
**Critical Production Issues (Enterprise Tier):**
- **Hotline:** [Emergency hotline to be provided]
- **Available:** 24/7/365
- **Response:** Within 1 hour

### 17.2 Administrative Contacts

#### 17.2.1 SLA Questions
For questions about this SLA:
- **Email:** sla@flowtracker.com.au
- **Phone:** [Phone number to be inserted]
- **Response Time:** 2 business days

#### 17.2.2 Service Credit Claims
To claim Service Credits:
- **Email:** billing@flowtracker.com.au
- **Include:** Account details, month of claim, specific incidents
- **Timeframe:** Within 30 days of end of affected month

#### 17.2.3 Escalations
For escalated issues:
- **Email:** escalation@flowtracker.com.au
- **Available to:** Professional and Enterprise tiers
- **Response Time:** 30 minutes during support hours

### 17.3 Executive Contacts

#### 17.3.1 Customer Success
**VP of Customer Success:**
- **Email:** customersuccess@flowtracker.com.au
- **Available for:** Enterprise customers, escalated disputes
- **Response Time:** 1 business day

#### 17.3.2 Legal and Compliance
**Legal Department:**
- **Email:** legal@flowtracker.com.au
- **For:** Legal notices, compliance inquiries, contractual matters
- **Response Time:** 3 business days

### 17.4 Online Resources

#### 17.4.1 Self-Service
- **Help Center:** [URL to be inserted]
- **Status Page:** status.flowtracker.com.au (to be established)
- **Documentation:** docs.flowtracker.com.au (to be established)
- **Community Forum:** community.flowtracker.com.au (to be established)

#### 17.4.2 Company Information
- **Website:** [URL to be inserted]
- **Business Address:** [Address to be inserted]
- **ABN:** [ABN to be inserted]

---

## 18. Acknowledgment and Acceptance

### 18.1 Agreement to SLA Terms
By using FlowTracker services, you acknowledge that:
- You have read and understood this Service Level Agreement
- You agree to be bound by the terms and conditions herein
- This SLA forms part of your agreement with FlowTracker
- You understand your responsibilities as outlined in Section 11

### 18.2 Entire Agreement
This SLA, together with:
- FlowTracker Terms of Service
- Your subscription agreement
- Privacy Policy
- Data Processing Agreement (if applicable)

Constitutes the entire agreement regarding service levels and commitments.

### 18.3 Questions
If you have questions about this SLA before accepting, please contact:
- **Email:** sla@flowtracker.com.au
- **Phone:** [Phone number to be inserted]

---

**Effective Date:** January 2025  
**Version:** 1.0  
**Next Review Date:** July 2025

---

## Appendix A: SLA Metrics Summary

### Uptime Commitments
| Tier | Monthly Uptime | Max Downtime/Month |
|------|----------------|-------------------|
| Essential | 99.5% | ~3 hours 36 minutes |
| Professional | 99.9% | ~43 minutes |
| Enterprise | 99.95% | ~22 minutes |

### Response Times
| Priority | Essential | Professional | Enterprise |
|----------|-----------|--------------|------------|
| Critical | 4 hours | 2 hours | 1 hour |
| High | 8 hours | 4 hours | 2 hours |
| Medium | 2 days | 1 day | 4 hours |
| Low | 5 days | 3 days | 1 day |

### Support Hours
| Tier | Hours | Phone | Chat |
|------|-------|-------|------|
| Essential | Business Hours | ✗ | ✗ |
| Professional | Extended (7AM-9PM Mon-Fri) | ✓ | ✓ |
| Enterprise | 24/7/365 | ✓ (Priority) | ✓ |

### Data Protection
| Tier | RPO | RTO | Backup Frequency |
|------|-----|-----|-----------------|
| Essential | 4 hours | 8 hours | Daily + 4-hour incremental |
| Professional | 1 hour | 4 hours | Daily + 4-hour incremental |
| Enterprise | 15 minutes | 2 hours | Continuous + hourly incremental |

---

*This Service Level Agreement has been prepared to provide clear, measurable commitments for FlowTracker services. It should be reviewed by qualified legal counsel before implementation.*

*For questions or clarifications about this SLA, please contact sla@flowtracker.com.au*

