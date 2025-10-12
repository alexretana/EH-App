#!/usr/bin/env python3
"""
Script to sanitize n8n workflow JSON files by replacing sensitive information
with environment variable references in n8n format: {{$env.VARIABLE_NAME}}
"""

import json
import re
from typing import Dict, List, Tuple, Any, Set
from pathlib import Path

class N8nSanitizer:
    def __init__(self):
        self.env_vars: Dict[str, str] = {}
        self.replacements: List[Tuple[str, str, str]] = []
        self.sensitive_patterns = {
            # Credential IDs (n8n specific)
            'credential_id': re.compile(r'"id":\s*"([A-Za-z0-9]{16})"'),
            # Email addresses
            'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            # Webhook IDs
            'webhook_id': re.compile(r'"webhookId":\s*"([a-f0-9-]{36})"'),
            # URLs with potential credentials
            'url': re.compile(r'https?://[^\s"\'<>]+'),
        }

    def create_env_var_name(self, context: str, value_type: str, index: int = None) -> str:
        """Create a descriptive environment variable name"""
        # Clean context for variable name
        clean_context = re.sub(r'[^A-Za-z0-9_]', '_', context.upper())
        clean_context = re.sub(r'_+', '_', clean_context).strip('_')

        if index is not None:
            return f"{clean_context}_{value_type}_{index}"
        return f"{clean_context}_{value_type}"

    def should_sanitize_credential_id(self, credential_id: str, context: Dict) -> bool:
        """Determine if a credential ID should be sanitized"""
        # These are credential references, always sanitize
        return True

    def should_sanitize_email(self, email: str) -> bool:
        """Determine if an email should be sanitized"""
        # Sanitize all emails
        return True

    def should_sanitize_url(self, url: str) -> bool:
        """Determine if a URL should be sanitized"""
        # Sanitize URLs that might contain credentials or are service-specific
        sensitive_patterns = [
            'localhost', 'discord-bot', '127.0.0.1',
            'webhook', 'api', 'oauth'
        ]
        return any(pattern in url.lower() for pattern in sensitive_patterns)

    def should_sanitize_webhook_id(self, webhook_id: str) -> bool:
        """Determine if a webhook ID should be sanitized"""
        # All webhook IDs should be sanitized
        return True

    def extract_credentials(self, obj: Any, path: str = "") -> None:
        """Recursively extract credentials from JSON structure"""
        if isinstance(obj, dict):
            # Check for instanceId (n8n instance identifier)
            if "instanceId" in obj and isinstance(obj["instanceId"], str):
                instance_id = obj["instanceId"]
                var_name = "N8N_INSTANCE_ID"

                if var_name not in self.env_vars:
                    self.env_vars[var_name] = instance_id
                    self.replacements.append((
                        f'"instanceId": "{instance_id}"',
                        f'"instanceId": "{{{{$env.{var_name}}}}}"',
                        "n8n Instance ID"
                    ))

            # Check for credential blocks
            if "credentials" in obj and isinstance(obj["credentials"], dict):
                for cred_type, cred_data in obj["credentials"].items():
                    if isinstance(cred_data, dict) and "id" in cred_data:
                        cred_id = cred_data["id"]
                        cred_name = cred_data.get("name", cred_type)

                        # Create environment variable name
                        var_name = self.create_env_var_name(
                            cred_name or cred_type,
                            "CREDENTIAL_ID",
                            len([k for k in self.env_vars.keys() if "CREDENTIAL_ID" in k])
                        )

                        if cred_id not in self.env_vars.values():
                            self.env_vars[var_name] = cred_id
                            self.replacements.append((
                                f'"id": "{cred_id}"',
                                f'"id": "{{{{$env.{var_name}}}}}"',
                                f"Credential ID for {cred_name}"
                            ))

            # Check for webhook IDs
            if "webhookId" in obj:
                webhook_id = obj["webhookId"]
                if self.should_sanitize_webhook_id(webhook_id):
                    var_name = self.create_env_var_name(
                        "WEBHOOK",
                        "ID",
                        len([k for k in self.env_vars.keys() if "WEBHOOK_ID" in k])
                    )

                    if webhook_id not in self.env_vars.values():
                        self.env_vars[var_name] = webhook_id
                        self.replacements.append((
                            f'"webhookId": "{webhook_id}"',
                            f'"webhookId": "{{{{$env.{var_name}}}}}"',
                            "Webhook ID"
                        ))

            # Check for URLs
            for key, value in obj.items():
                if isinstance(value, str):
                    # Check for URLs
                    if key in ["url", "baseURL", "host"] or "url" in key.lower():
                        if value.startswith("http") and self.should_sanitize_url(value):
                            var_name = self.create_env_var_name(
                                key,
                                "URL",
                                len([k for k in self.env_vars.keys() if "_URL" in k])
                            )

                            if value not in self.env_vars.values():
                                self.env_vars[var_name] = value
                                self.replacements.append((
                                    f'"{key}": "{value}"',
                                    f'"{key}": "{{{{$env.{var_name}}}}}"',
                                    f"URL for {key}"
                                ))

                    # Check for email addresses
                    if "@" in value:
                        email_matches = re.findall(self.sensitive_patterns['email'], value)
                        for email in email_matches:
                            if self.should_sanitize_email(email):
                                var_name = self.create_env_var_name(
                                    "USER",
                                    "EMAIL",
                                    len([k for k in self.env_vars.keys() if "EMAIL" in k])
                                )

                                if email not in self.env_vars.values():
                                    self.env_vars[var_name] = email
                                    # For emails in calendar references, we need to be careful
                                    # They might appear in different contexts
                                    self.replacements.append((
                                        f'"{email}"',
                                        f'"{{{{$env.{var_name}}}}}"',
                                        f"Email address"
                                    ))

                # Recurse
                self.extract_credentials(value, f"{path}.{key}")

        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                self.extract_credentials(item, f"{path}[{i}]")

    def sanitize_file(self, file_path: Path) -> Tuple[str, int]:
        """Sanitize a single JSON file"""
        print(f"\nProcessing {file_path.name}...")

        # Read original content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse JSON to extract structured credentials
        try:
            data = json.loads(content)
            self.extract_credentials(data)
        except json.JSONDecodeError as e:
            print(f"Warning: Could not parse JSON: {e}")
            return content, 0

        # Apply replacements
        sanitized_content = content
        replacement_count = 0

        for old_value, new_value, description in self.replacements:
            if old_value in sanitized_content:
                sanitized_content = sanitized_content.replace(old_value, new_value)
                replacement_count += 1
                print(f"  [+] Replaced: {description}")

        return sanitized_content, replacement_count

    def generate_env_file(self) -> str:
        """Generate .env file content"""
        lines = [
            "# Environment variables for n8n workflows",
            "# Generated by sanitize_script.py",
            "# IMPORTANT: Keep this file secure and do not commit to version control",
            "",
        ]

        # Group by type
        instance_vars = {k: v for k, v in self.env_vars.items() if "INSTANCE" in k}
        credential_vars = {k: v for k, v in self.env_vars.items() if "CREDENTIAL" in k}
        webhook_vars = {k: v for k, v in self.env_vars.items() if "WEBHOOK" in k}
        email_vars = {k: v for k, v in self.env_vars.items() if "EMAIL" in k}
        url_vars = {k: v for k, v in self.env_vars.items() if "URL" in k}

        if instance_vars:
            lines.append("# n8n Instance Configuration")
            for var, value in sorted(instance_vars.items()):
                lines.append(f"{var}={value}")
            lines.append("")

        if credential_vars:
            lines.append("# Credential IDs")
            for var, value in sorted(credential_vars.items()):
                lines.append(f"{var}={value}")
            lines.append("")

        if webhook_vars:
            lines.append("# Webhook IDs")
            for var, value in sorted(webhook_vars.items()):
                lines.append(f"{var}={value}")
            lines.append("")

        if email_vars:
            lines.append("# Email Addresses")
            for var, value in sorted(email_vars.items()):
                lines.append(f"{var}={value}")
            lines.append("")

        if url_vars:
            lines.append("# URLs")
            for var, value in sorted(url_vars.items()):
                lines.append(f"{var}={value}")
            lines.append("")

        return "\n".join(lines)

def main():
    # File paths
    files = [
        Path(r"C:\Users\alexr\scratch\santize_n8n_jsons\EventHorizonArchivistAgent.json"),
        Path(r"C:\Users\alexr\scratch\santize_n8n_jsons\EventHorizonDayScheduler.json"),
        Path(r"C:\Users\alexr\scratch\santize_n8n_jsons\EventHorizonPlanner.json"),
    ]

    sanitizer = N8nSanitizer()
    total_replacements = 0

    # Process each file
    sanitized_files = {}
    for file_path in files:
        if not file_path.exists():
            print(f"Warning: {file_path} not found, skipping...")
            continue

        sanitized_content, count = sanitizer.sanitize_file(file_path)
        sanitized_files[file_path] = sanitized_content
        total_replacements += count

    # Write sanitized files
    print("\n" + "="*60)
    print("Writing sanitized files...")
    for file_path, content in sanitized_files.items():
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [+] Written: {file_path.name}")

    # Generate .env file
    env_content = sanitizer.generate_env_file()
    env_path = Path(r"C:\Users\alexr\scratch\santize_n8n_jsons\.env")
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    print(f"  [+] Written: .env")

    # Summary
    print("\n" + "="*60)
    print("SANITIZATION COMPLETE")
    print("="*60)
    print(f"Total files processed: {len(sanitized_files)}")
    print(f"Total replacements made: {total_replacements}")
    print(f"Total environment variables created: {len(sanitizer.env_vars)}")
    print(f"\nEnvironment variables by type:")

    instance_count = len([k for k in sanitizer.env_vars.keys() if "INSTANCE" in k])
    credential_count = len([k for k in sanitizer.env_vars.keys() if "CREDENTIAL" in k])
    webhook_count = len([k for k in sanitizer.env_vars.keys() if "WEBHOOK" in k])
    email_count = len([k for k in sanitizer.env_vars.keys() if "EMAIL" in k])
    url_count = len([k for k in sanitizer.env_vars.keys() if "URL" in k])

    print(f"  - Instance IDs: {instance_count}")
    print(f"  - Credential IDs: {credential_count}")
    print(f"  - Webhook IDs: {webhook_count}")
    print(f"  - Email addresses: {email_count}")
    print(f"  - URLs: {url_count}")

    print(f"\nEnvironment variables created:")
    for var in sorted(sanitizer.env_vars.keys()):
        print(f"  - {var}")

if __name__ == "__main__":
    main()
