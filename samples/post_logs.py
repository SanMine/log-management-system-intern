#!/usr/bin/env python3

"""
Batch Log Uploader for Log Management System

This script uploads JSON log files to the backend API.
Supports both single logs and batch uploads.
"""

import requests
import json
import sys
import os
from pathlib import Path

# Configuration
API_URL = os.environ.get('API_URL', 'http://localhost:5004')
ENDPOINT_SINGLE = f'{API_URL}/api/ingest/http'
ENDPOINT_BATCH = f'{API_URL}/api/ingest/batch'

# Colors for terminal output
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
NC = '\033[0m'  # No Color


def send_single_log(log_data):
    """Send a single log event"""
    try:
        response = requests.post(
            ENDPOINT_SINGLE,
            json=log_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"{GREEN}✓{NC} Success: ID {result.get('id', 'N/A')}")
            return True
        else:
            print(f"{RED}✗{NC} Failed: HTTP {response.status_code}")
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print(f"{RED}✗{NC} Error: {str(e)}")
        return False


def send_batch_logs(logs_array):
    """Send multiple logs at once"""
    try:
        response = requests.post(
            ENDPOINT_BATCH,
            json=logs_array,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"{GREEN}✓{NC} Batch upload success!")
            print(f"  Total: {result.get('total', 0)}")
            print(f"  Succeeded: {result.get('succeeded', 0)}")
            print(f"  Failed: {result.get('failed', 0)}")
            return True
        else:
            print(f"{RED}✗{NC} Failed: HTTP {response.status_code}")
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print(f"{RED}✗{NC} Error: {str(e)}")
        return False


def load_json_file(filepath):
    """Load and parse JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"{RED}Error loading file:{NC} {str(e)}")
        return None


def main():
    print("=" * 50)
    print("Log Management System - Batch Uploader")
    print("=" * 50)
    print(f"API URL: {API_URL}")
    print()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print(f"  {sys.argv[0]} <json-file>")
        print(f"  {sys.argv[0]} samples/batch-logs-sample.json")
        print()
        print("Environment variables:")
        print("  API_URL - Backend URL (default: http://localhost:5004)")
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    if not os.path.exists(filepath):
        print(f"{RED}Error:{NC} File not found: {filepath}")
        sys.exit(1)
    
    print(f"Loading file: {filepath}")
    data = load_json_file(filepath)
    
    if data is None:
        sys.exit(1)
    
    # Determine if single log or batch
    if isinstance(data, list):
        print(f"Detected batch upload ({len(data)} logs)")
        print()
        success = send_batch_logs(data)
    elif isinstance(data, dict):
        print("Detected single log")
        print()
        success = send_single_log(data)
    else:
        print(f"{RED}Error:{NC} Invalid JSON format")
        print("Expected: JSON object or array of objects")
        sys.exit(1)
    
    print()
    if success:
        print(f"{GREEN}Upload complete!{NC}")
        print("Check the dashboard at: http://localhost:5174")
    else:
        print(f"{RED}Upload failed!{NC}")
        sys.exit(1)


if __name__ == '__main__':
    main()
