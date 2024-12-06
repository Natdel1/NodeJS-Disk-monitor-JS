import requests
import json
from datetime import datetime

def send_line_notify(message, token):
    line_notify_api = "https://notify-api.line.me/api/notify"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"message": message}
    try:
        response = requests.post(line_notify_api, headers=headers, data=payload)
        if response.status_code == 200:
            print("Message sent to LINE successfully.")
        else:
            print(f"Failed to send message. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending message to LINE: {e}")


with open('config.json', 'r') as f:
    config_data = json.load(f)


line_token = "v6NRGQLzFcpEWirMOUDuER9XZ7oSv9HYnfYLjz4BMvD"

for config in config_data:
    api_url = config["apiUrl"]
    ip = config["ip"]
    username = config["username"]
    password = config["password"]

    request_url = f"{api_url}?ip={ip}&username={username}&password={password}"


    try:
        response = requests.get(request_url)
        

        if response.status_code == 200:
            data = response.json()
            

            disk_usage_info = data.get('disk_usage', {})
            hostname = disk_usage_info.get('hostname', 'N/A')
            total_space = disk_usage_info.get('size', 'N/A')
            free_space = disk_usage_info.get('avail', 'N/A')
            disk_usage = disk_usage_info.get('use_percentage', 'N/A')

            if isinstance(disk_usage, str) and disk_usage.endswith('%'):
                usage_percentage = float(disk_usage.rstrip('%')) 
                if usage_percentage > 94:
          
                    current_time = datetime.now().strftime('%I:%M:%S %p')  # เวลาในรูปแบบ 2:42:54 PM
                    message = f"Disk Usage Warning\nSent by IP: {ip} Hostname: {hostname} Total Space: {total_space} Free Space: {free_space} Disk Usage: {disk_usage} Time: {current_time}"
                    

                    send_line_notify(message, line_token)
        
        else:
            print(f"Failed to get data from {ip}. Status code: {response.status_code}")
    
    except requests.exceptions.RequestException as e:
        print(f"Error with {ip}: {e}")
