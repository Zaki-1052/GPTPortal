import os
import shutil
from datetime import datetime
import re

# Source and destination paths
source_path = "path/to/repo/GPTPortal/public/uploads/chats"
icloud_path = "/Users/your_username/Library/Mobile Documents/com~apple~CloudDocs/ChatGPT/chats"

def format_content(content):
    lines = content.split('\n')
    formatted_content = []
    
    for line in lines:
        if line.startswith("System:") or line.startswith("Human:") or line.startswith("Assistant:"):
            formatted_content.append(f"\n{line}\n")
        else:
            formatted_content.append(line)
    
    return '\n'.join(formatted_content)

def create_html(content, filename):
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{filename}</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }}
            .human {{ background-color: #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 5px; }}
            .assistant {{ background-color: #e6f3ff; padding: 10px; margin-bottom: 10px; border-radius: 5px; }}
        </style>
    </head>
    <body>
    """
    
    lines = content.split('\n')
    current_speaker = None
    for line in lines:
        if line.startswith("Human:"):
            if current_speaker != "human":
                if current_speaker:
                    html_content += "</div>"
                html_content += '<div class="human">'
                current_speaker = "human"
        elif line.startswith("Assistant:"):
            if current_speaker != "assistant":
                if current_speaker:
                    html_content += "</div>"
                html_content += '<div class="assistant">'
                current_speaker = "assistant"
        
        html_content += f"{line}<br>"
    
    if current_speaker:
        html_content += "</div>"
    
    html_content += """
    </body>
    </html>
    """
    
    return html_content

def move_and_format_files():
    # Create the destination folder if it doesn't exist
    os.makedirs(icloud_path, exist_ok=True)
    
    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Iterate through files in the source directory
    for filename in os.listdir(source_path):
        if filename.endswith(".txt"):
            source_file = os.path.join(source_path, filename)
            
            # Read the content of the file
            with open(source_file, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Format the content
            formatted_content = format_content(content)
            
            # Create new filenames with timestamp
            base_name = os.path.splitext(filename)[0]
            new_txt_filename = f"{base_name}_{timestamp}.txt"
            new_html_filename = f"{base_name}_{timestamp}.html"
            
            # Save formatted content as .txt
            txt_destination = os.path.join(icloud_path, new_txt_filename)
            with open(txt_destination, 'w', encoding='utf-8') as file:
                file.write(formatted_content)
            
            # Save formatted content as .html
            html_content = create_html(formatted_content, base_name)
            html_destination = os.path.join(icloud_path, new_html_filename)
            with open(html_destination, 'w', encoding='utf-8') as file:
                file.write(html_content)
            
            # Remove the original file
            os.remove(source_file)
            
            print(f"Moved and formatted: {filename} -> {new_txt_filename} and {new_html_filename}")

if __name__ == "__main__":
    move_and_format_files()