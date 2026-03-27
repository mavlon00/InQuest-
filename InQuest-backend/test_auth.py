
import requests
import json

url = "http://localhost:8000/api/v1/auth/register"
payload = {"phone_number": "+2348012345678"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
