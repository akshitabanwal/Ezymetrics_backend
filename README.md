# Ezymetrics_backend  
**Overview**
The backend service performs the following tasks:

API Integration: Fetches dummy data from an external API simulating CRM and marketing platform integration.
Data Storage: Stores the fetched data in a PostgreSQL database.
ETL Process: Transforms and processes the raw data into a meaningful format.
Reporting: Generates CSV reports on stored data.
Alerts: Sends email notifications when certain conditions (lead count exceeding a threshold) are met.


**Technologies used**

Node.js: Backend runtime environment.
Express: Framework for building the API.
PostgreSQL: Database for storing fetched data.
Nodemailer: Sending email alerts.
json2csv: Converts JSON data to CSV format.



**API Endpoints**
Fetch and Store Data
Endpoint: /crm/leads
Method: GET
Description: Fetches dummy CRM data, stores it in the PostgreSQL database, and sends an email alert if the number of leads exceeds the threshold.
example=http://localhost:8001/crm/leads


Generate CSV Report
Endpoint: /crm/reports/csv
Method: GET
Description: Generates a CSV report containing all the stored leads and allows you to download it.
example=http://localhost:8001/crm/reports/csv

