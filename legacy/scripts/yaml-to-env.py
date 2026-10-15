#!/usr/bin/env python3
"""
Convert JSON secrets to .env format
Usage: sops -d --output-type json secrets.enc.yaml | python3 scripts/yaml-to-env.py > .env
"""

import sys
import json

def json_to_env(json_content):
    """Convert nested JSON to flat .env format"""
    try:
        data = json.loads(json_content)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Error decoding JSON: {e}\n")
        sys.exit(1)
        
    env_lines = []
    
    for section, values in data.items():
        if isinstance(values, dict):
            for key, value in values.items():
                env_key = f"{section.upper()}_{key.upper()}"
                env_lines.append(f"{env_key}={value}")
        else:
            env_key = section.upper()
            env_lines.append(f"{env_key}={values}")
    
    return '\n'.join(env_lines)

if __name__ == '__main__':
    content = sys.stdin.read()
    print(json_to_env(content))
