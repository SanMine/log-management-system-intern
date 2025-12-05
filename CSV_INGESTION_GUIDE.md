# CSV File Ingestion Guide

## Overview

The log management system now supports uploading **CSV files** in addition to JSON files for bulk log ingestion.

## Supported File Types

- ✅ **JSON** (`.json`) - Array of log objects
- ✅ **CSV** (`.csv`) - Headers in first row, one log per row

## CSV Format Requirements

### Basic Structure

```csv
tenant,source,event_type,user,ip,timestamp
demo.com,api,login_failed,alice,192.168.1.100,2025-12-04T14:00:00Z
demo.com,api,login_success,alice,192.168.1.100,2025-12-04T14:02:00Z
```

### Required Columns

- **tenant** - Tenant name (e.g., "demo.com")
- **source** - Log source type: `api`, `firewall`, `network`, `crowdstrike`, `aws`, `m365`, `ad`

### Optional Columns (vary by source)

All columns from the central schema are supported:
- `event_type`, `event_id`, `user`, `host`, `process`
- `ip`, `src_ip`, `dst_ip`, `protocol`, `src_port`, `dst_port`
- `severity`, `action`, `url`, `http_method`, `status_code`
- `timestamp`, `@timestamp`
- And more...

## CSV Examples

### Example 1: API Logs

```csv
tenant,source,event_type,user,ip,severity,action,timestamp
demo.com,api,login_failed,alice,192.168.1.100,5,deny,2025-12-04T14:00:00Z
demo.com,api,user_created,admin,192.168.1.1,3,create,2025-12-04T14:05:00Z
```

### Example 2: Active Directory Logs

```csv
tenant,source,event_type,event_id,user,host,ip,logon_type,timestamp
demoA.com,ad,LogonFailed,4625,domain\user,DC01,203.0.113.77,3,2025-12-04T14:00:00Z
demoA.com,ad,LogonSuccess,4624,domain\admin,DC01,192.168.1.100,2,2025-12-04T14:05:00Z
```

### Example 3: CrowdStrike Logs

```csv
tenant,source,event_type,host,process,severity,action,timestamp
demoA.com,crowdstrike,malware_detected,WIN10-01,powershell.exe,8,quarantine,2025-12-04T14:00:00Z
demoA.com,crowdstrike,suspicious_activity,WIN10-02,cmd.exe,6,alert,2025-12-04T14:05:00Z
```

## How to Upload CSV Files

### Via Dashboard

1. Go to **Dashboard** page
2. Click **Upload JSON** button
3. Select your `.csv` file
4. Click Upload
5. System will automatically detect CSV format and parse it

### Via API (curl)

```bash
curl -X POST http://localhost:5004/api/ingest/file \
  -F "file=@samples/test-api-logs.csv"
```

## Response Format

### Successful Upload

```json
{
  "success": true,
  "message": "Successfully ingested 5 logs from CSV file",
  "fileType": "csv",
  "results": {
    "total": 5,
    "inserted": 5,
    "failed": 0
  }
}
```

### Partial Success

```json
{
  "success": false,
  "message": "Partially successful: 3 ingested, 2 failed",
  "fileType": "csv",
  "results": {
    "total": 5,
    "inserted": 3,
    "failed": 2,
    "errors": [
      {
        "index": 1,
        "row": 2,
        "error": "Missing required field: source",
        "log": { ... }
      }
    ]
  }
}
```

## CSV Parsing Features

✅ **Auto-detection** - Automatically uses first row as column headers  
✅ **Type casting** - Numbers and booleans are automatically converted  
✅ **Whitespace trimming** - Extra spaces are removed  
✅ **Empty line skipping** - Blank rows are ignored  
✅ **Error handling** - Continues processing valid rows even if some fail

## Tips for Creating CSV Files

1. **Use proper headers** - Match field names to log schema
2. **Include timestamp** - Use ISO 8601 format: `2025-12-04T14:00:00Z`
3. **Escape special characters** - Use quotes for fields with commas
4. **Keep it simple** - Include only necessary columns
5. **Test with small files** - Verify format before uploading large files

## Sample CSV Files

Sample CSV files are available in the `/samples` directory:

- `test-api-logs.csv` - API log examples
- `test-ad-logs.csv` - Active Directory examples
- `test-crowdstrike-logs.csv` - CrowdStrike examples

## Troubleshooting

### Error: "Missing required field: source"

**Solution:** Ensure your CSV has a `source` column with valid values.

### Error: "CSV parsing failed"

**Solution:** Check for:
- Missing headers in first row
- Malformed CSV (unclosed quotes, etc.)
- Invalid characters

### Some rows fail validation

**Solution:** Check the error response for specific row numbers and missing fields.

---

**CSV file support makes bulk log importing much easier!** 🎉
