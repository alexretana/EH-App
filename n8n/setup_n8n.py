#!/usr/bin/env python3
"""
n8n Automated Setup Script
Creates credentials and imports workflows programmatically using n8n's REST API
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional

# Configuration
N8N_BASE_URL = os.getenv('N8N_BASE_URL', 'http://localhost:5678')
N8N_API_KEY = os.getenv('N8N_API_KEY', '')
SCRIPT_DIR = Path(__file__).parent
ENV_FILE = SCRIPT_DIR / '.env'
WORKFLOW_FILES = [
    'EventHorizonArchivistAgent.json',
    'EventHorizonDayScheduler.json',
    'EventHorizonPlanner.json'
]

# Credential type mapping (credential type name -> environment variable prefix)
CREDENTIAL_TYPES = {
    'googleCalendarOAuth2Api': {
        'type': 'googleCalendarOAuth2Api',
        'name': 'Google Calendar account',
        'env_id': 'GOOGLE_CALENDAR_ACCOUNT_CREDENTIAL_ID_4',
        'nodesAccess': [{'nodeType': 'n8n-nodes-base.googleCalendar'}]
    },
    'openRouterApi': {
        'type': 'openRouterApi',
        'name': 'OpenRouter account',
        'env_id': 'OPENROUTER_ACCOUNT_CREDENTIAL_ID_2',
        'nodesAccess': [{'nodeType': '@n8n/n8n-nodes-langchain.lmChatOpenRouter'}]
    },
    'perplexityApi': {
        'type': 'perplexityApi',
        'name': 'Perplexity account',
        'env_id': 'PERPLEXITY_ACCOUNT_CREDENTIAL_ID_0',
        'nodesAccess': [{'nodeType': 'n8n-nodes-base.perplexityTool'}]
    },
    'postgres': {
        'type': 'postgres',
        'name': 'Postgres account',
        'env_id': 'POSTGRES_ACCOUNT_CREDENTIAL_ID_1',
        'nodesAccess': [
            {'nodeType': 'n8n-nodes-base.postgres'},
            {'nodeType': 'n8n-nodes-base.postgresTool'}
        ]
    },
    'redis': {
        'type': 'redis',
        'name': 'Redis account',
        'env_id': 'REDIS_ACCOUNT_CREDENTIAL_ID_3',
        'nodesAccess': [{'nodeType': '@n8n/n8n-nodes-langchain.memoryRedisChat'}]
    },
    'smtp': {
        'type': 'smtp',
        'name': 'SMTP account',
        'env_id': 'SMTP_ACCOUNT_CREDENTIAL_ID_5',
        'nodesAccess': [{'nodeType': 'n8n-nodes-base.emailSend'}]
    }
}


def load_env_file() -> Dict[str, str]:
    """Load environment variables from .env file"""
    env_vars = {}
    if not ENV_FILE.exists():
        print(f"❌ .env file not found at {ENV_FILE}")
        print("   Please copy .env.example to .env and configure your credentials")
        sys.exit(1)
    
    with open(ENV_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars


def wait_for_n8n(max_attempts=30, delay=2):
    """Wait for n8n to be ready"""
    print(f"⏳ Waiting for n8n to be ready at {N8N_BASE_URL}...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{N8N_BASE_URL}/healthz", timeout=5)
            if response.status_code == 200:
                print("✅ n8n is ready!")
                return True
        except requests.exceptions.RequestException:
            pass
        
        if attempt < max_attempts - 1:
            time.sleep(delay)
            print(f"   Attempt {attempt + 1}/{max_attempts}...")
    
    print(f"❌ n8n did not become ready after {max_attempts * delay} seconds")
    return False


def create_credential(cred_type: str, cred_config: Dict, api_key: str, env_vars: Dict[str, str]) -> Optional[str]:
    """Create a credential in n8n and return its ID"""
    headers = {
        'X-N8N-API-KEY': api_key,
        'Content-Type': 'application/json'
    }
    
    # Extract credential data from environment variables based on credential type
    credential_data = get_credential_data(cred_type, env_vars)
    
    if not credential_data:
        print(f"   ❌ Missing credential data for {cred_config['name']}")
        return None
    
    payload = {
        'name': cred_config['name'],
        'type': cred_config['type'],
        'nodesAccess': cred_config['nodesAccess'],
        'data': credential_data
    }
    
    try:
        response = requests.post(
            f"{N8N_BASE_URL}/api/v1/credentials",
            headers=headers,
            json=payload
        )
        
        if response.status_code in [200, 201]:
            cred_data = response.json()
            cred_id = cred_data.get('data', {}).get('id') or cred_data.get('id')
            print(f"   ✅ Created credential: {cred_config['name']} (ID: {cred_id})")
            return cred_id
        else:
            print(f"   ❌ Failed to create credential {cred_config['name']}: {response.status_code}")
            print(f"      Response: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Error creating credential {cred_config['name']}: {str(e)}")
        return None


def get_credential_data(cred_type: str, env_vars: Dict[str, str]) -> Optional[Dict]:
    """Extract credential data from environment variables based on credential type"""
    
    if cred_type == 'googleCalendarOAuth2Api':
        # OAuth2 credentials would typically require:
        # - clientId, clientSecret, accessToken, refreshToken, etc.
        # For this example, we'll use placeholder OAuth2 data
        # In production, you'd implement proper OAuth2 flow or use existing tokens
        return {
            'clientId': env_vars.get('GOOGLE_CLIENT_ID', ''),
            'clientSecret': env_vars.get('GOOGLE_CLIENT_SECRET', ''),
            'accessToken': env_vars.get('GOOGLE_ACCESS_TOKEN', ''),
            'refreshToken': env_vars.get('GOOGLE_REFRESH_TOKEN', ''),
            'expiresAt': env_vars.get('GOOGLE_TOKEN_EXPIRES_AT', ''),
        }
    
    elif cred_type == 'openRouterApi':
        return {
            'apiKey': env_vars.get('OPENROUTER_API_KEY', '')
        }
    
    elif cred_type == 'perplexityApi':
        return {
            'apiKey': env_vars.get('PERPLEXITY_API_KEY', '')
        }
    
    elif cred_type == 'postgres':
        return {
            'host': env_vars.get('POSTGRES_HOST', 'postgres'),
            'port': env_vars.get('POSTGRES_PORT', '5432'),
            'database': env_vars.get('POSTGRES_DB', 'event_horizon'),
            'user': env_vars.get('POSTGRES_USER', 'event_horizon_user'),
            'password': env_vars.get('POSTGRES_PASSWORD', 'eventhorizon'),
            'sslMode': env_vars.get('POSTGRES_SSL_MODE', 'disable'),
            'allowUnauthorizedCerts': env_vars.get('POSTGRES_ALLOW_UNAUTHORIZED_CERTS', 'false')
        }
    
    elif cred_type == 'redis':
        return {
            'host': env_vars.get('REDIS_HOST', 'redis'),
            'port': env_vars.get('REDIS_PORT', '6379'),
            'password': env_vars.get('REDIS_PASSWORD', ''),
            'database': env_vars.get('REDIS_DATABASE', '0')
        }
    
    elif cred_type == 'smtp':
        return {
            'host': env_vars.get('SMTP_HOST', ''),
            'port': env_vars.get('SMTP_PORT', '587'),
            'secure': env_vars.get('SMTP_SECURE', 'false'),
            'user': env_vars.get('SMTP_USER', ''),
            'password': env_vars.get('SMTP_PASSWORD', ''),
            'allowUnauthorizedCerts': env_vars.get('SMTP_ALLOW_UNAUTHORIZED_CERTS', 'false')
        }
    
    return None


def create_all_credentials(api_key: str, env_vars: Dict[str, str]) -> Dict[str, str]:
    """Create all required credentials and return mapping of env_id -> credential_id"""
    print("\n📋 Creating credentials...")
    credential_mapping = {}
    
    for cred_type, cred_config in CREDENTIAL_TYPES.items():
        print(f"\n   Creating {cred_config['name']}...")
        cred_id = create_credential(cred_type, cred_config, api_key, env_vars)
        
        if cred_id:
            credential_mapping[cred_config['env_id']] = cred_id
    
    return credential_mapping


def update_workflow_credentials(workflow_data: Dict, credential_mapping: Dict[str, str]) -> Dict:
    """Update workflow JSON with new credential IDs"""
    workflow_str = json.dumps(workflow_data)
    
    # Replace all environment variable references with actual credential IDs
    for env_var, cred_id in credential_mapping.items():
        workflow_str = workflow_str.replace(f"{{{{$env.{env_var}}}}}", cred_id)
    
    return json.loads(workflow_str)


def import_workflow(workflow_file: str, credential_mapping: Dict[str, str], api_key: str) -> Optional[str]:
    """Import a workflow into n8n and return its ID"""
    workflow_path = SCRIPT_DIR / workflow_file
    
    if not workflow_path.exists():
        print(f"   ❌ Workflow file not found: {workflow_file}")
        return None
    
    try:
        with open(workflow_path, 'r', encoding='utf-8') as f:
            workflow_data = json.load(f)
        
        # Update credential references
        workflow_data = update_workflow_credentials(workflow_data, credential_mapping)
        
        # Remove fields that shouldn't be in the import
        workflow_data.pop('id', None)
        workflow_data.pop('versionId', None)
        workflow_data.pop('pinData', None)  # Remove pinned data
        
        headers = {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{N8N_BASE_URL}/api/v1/workflows",
            headers=headers,
            json=workflow_data
        )
        
        if response.status_code in [200, 201]:
            imported_workflow = response.json()
            workflow_id = imported_workflow.get('data', {}).get('id') or imported_workflow.get('id')
            workflow_name = workflow_data.get('name', workflow_file)
            print(f"   ✅ Imported workflow: {workflow_name} (ID: {workflow_id})")
            return workflow_id
        else:
            print(f"   ❌ Failed to import workflow {workflow_file}: {response.status_code}")
            print(f"      Response: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Error importing workflow {workflow_file}: {str(e)}")
        return None


def activate_workflow(workflow_id: str, api_key: str) -> bool:
    """Activate a workflow"""
    headers = {
        'X-N8N-API-KEY': api_key,
        'Content-Type': 'application/json'
    }
    
    payload = {'active': True}
    
    try:
        response = requests.patch(
            f"{N8N_BASE_URL}/api/v1/workflows/{workflow_id}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            print(f"   ✅ Activated workflow (ID: {workflow_id})")
            return True
        else:
            print(f"   ❌ Failed to activate workflow {workflow_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error activating workflow {workflow_id}: {str(e)}")
        return False


def main():
    """Main execution function"""
    print("=" * 60)
    print("🚀 n8n Automated Setup Script")
    print("=" * 60)
    
    # Check for API key
    if not N8N_API_KEY:
        print("\n❌ N8N_API_KEY environment variable is required!")
        print("   Please set N8N_API_KEY before running this script")
        sys.exit(1)
    
    # Load environment variables
    print("\n📂 Loading environment variables from .env file...")
    env_vars = load_env_file()
    print(f"   ✅ Loaded {len(env_vars)} environment variables")
    
    # Wait for n8n to be ready
    if not wait_for_n8n():
        sys.exit(1)
    
    # Create credentials
    credential_mapping = create_all_credentials(N8N_API_KEY, env_vars)
    print(f"\n✅ Created {len(credential_mapping)} credentials")
    
    # Import workflows
    print("\n📥 Importing workflows...")
    workflow_ids = []
    
    for workflow_file in WORKFLOW_FILES:
        print(f"\n   Importing {workflow_file}...")
        workflow_id = import_workflow(workflow_file, credential_mapping, N8N_API_KEY)
        if workflow_id:
            workflow_ids.append(workflow_id)
    
    print(f"\n✅ Imported {len(workflow_ids)} workflows")
    
    # Activate workflows
    print("\n⚡ Activating workflows...")
    activated_count = 0
    
    for workflow_id in workflow_ids:
        if activate_workflow(workflow_id, N8N_API_KEY):
            activated_count += 1
    
    print(f"\n✅ Activated {activated_count} workflows")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print(f"   Credentials created: {len(credential_mapping)}")
    print(f"   Workflows imported: {len(workflow_ids)}")
    print(f"   Workflows activated: {activated_count}")
    print("\n🎉 Your n8n instance is now fully configured!")


if __name__ == '__main__':
    main()