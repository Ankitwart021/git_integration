import argparse
import json
import os
import re

COMPOSE_FILE = "docker-compose.yml"
ENV_FILE = ".env"
ENV_EXAMPLE = ".env.example"

def generate_compose(nodes: int):
    print(f"Generating {COMPOSE_FILE} with {nodes} SonarQube nodes...")
    
    compose_content = "version: '3.8'\n\nservices:\n"
    
    for i in range(1, nodes + 1):
        port = 9000 + i
        compose_content += f"""  sonarqube-{i}:
    image: sonarqube:26.3.0.120487-community
    container_name: sq-node-{i}
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    ports:
      - "{port}:9000"
    networks:
      - vs-net
    volumes:
      - sq{i}_data:/opt/sonarqube/data
      - sq{i}_extensions:/opt/sonarqube/extensions
"""
        compose_content += "\n"
        
    compose_content += "networks:\n  vs-net:\n\nvolumes:\n"
    for i in range(1, nodes + 1):
        compose_content += f"  sq{i}_data:\n  sq{i}_extensions:\n"
        
    with open(COMPOSE_FILE, "w") as f:
        f.write(compose_content)

def update_env_file(file_path: str, nodes: int, is_example: bool = False):
    if not os.path.exists(file_path):
        return

    instances = {}
    for i in range(1, nodes + 1):
        port = 9000 + i
        token = f"insert_token_{i}" if is_example else f"squ_token_{i}_override_me"
        instances[f"http://localhost:{port}"] = token

    # We preserve existing tokens in the real .env if possible
    if not is_example:
        try:
            with open(file_path, "r") as f:
                lines = f.readlines()
            for line in lines:
                if line.startswith("SONAR_INSTANCES="):
                    existing = json.loads(line.split("=", 1)[1].strip())
                    for k, v in existing.items():
                        if k in instances:
                            instances[k] = v
        except Exception:
            pass
            
    json_str = json.dumps(instances)
    
    with open(file_path, "r") as f:
        content = f.read()
        
    if "SONAR_INSTANCES=" in content:
        content = re.sub(r'SONAR_INSTANCES=.*', f'SONAR_INSTANCES={json_str}', content)
    else:
        content += f"\nSONAR_INSTANCES={json_str}\n"
        
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Updated {file_path}")

def main():
    parser = argparse.ArgumentParser(description="Generate SonarQube docker-compose and update .env configuration.")
    parser.add_argument("--nodes", type=int, default=3, help="Number of SonarQube nodes to deploy")
    args = parser.parse_args()
    
    generate_compose(args.nodes)
    update_env_file(ENV_FILE, args.nodes, is_example=False)
    update_env_file(ENV_EXAMPLE, args.nodes, is_example=True)
    print("Cluster configuration completed successfully!")

if __name__ == "__main__":
    main()
