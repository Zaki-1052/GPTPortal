import os
import shutil
from datetime import datetime
import re

# Source and destination paths
source_path = "/Users/zakiralibhai/Documents/VS_Code/MyGPTPortal/public/uploads/chats"
html_source_path = "/Users/zakiralibhai/Documents/HTML_ChatGPTs"
icloud_base_path = "/Users/zakiralibhai/Library/Mobile Documents/com~apple~CloudDocs/ChatGPT"

# Create subdirectories
txt_path = os.path.join(icloud_base_path, "txt")
processed_markdown_path = os.path.join(icloud_base_path, "markdown")
original_html_path = os.path.join(icloud_base_path, "html")

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def format_filename(filename):
    # Remove any existing date pattern and file extension
    base_name = re.sub(r'-\d{2}-\d{2}.*$', '', os.path.splitext(filename)[0])
    # Add current date
    current_date = datetime.now().strftime("-%m-%d")
    return f"{base_name}{current_date}"

def format_content(content):
    formatted_content = []
    current_speaker = None
    in_summary = False
    in_context = False
    
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            formatted_content.append("")
            continue
        
        if line.startswith(("System:", "Human:", "Assistant:")):
            if current_speaker:
                formatted_content.append("")  # Add a blank line between speakers
            current_speaker = line.split(":")[0]
            formatted_content.append(f"## {line}")
        elif line.startswith("---"):
            if "Conversation Summary:" in line:
                in_summary = True
                formatted_content.append("\n## Summary")
            else:
                formatted_content.append(line)
        elif line.startswith("CONTEXT:"):
            in_context = True
            formatted_content.append("\n## Context")
        elif line.startswith(("Total Tokens:", "Total Cost:")):
            formatted_content.append(f"**{line}**")
        elif in_summary or in_context:
            formatted_content.append(line)
        else:
            formatted_content.append(line)
    
    return '\n'.join(formatted_content)

def create_markdown(content, filename):
    markdown_content = f"# {filename}\n\n"
    markdown_content += content
    return markdown_content

def process_txt_files():
    for filename in os.listdir(source_path):
        if filename.endswith(".txt"):
            source_file = os.path.join(source_path, filename)
            new_filename = format_filename(filename)
            
            # Move txt file to txt_path without modification
            txt_destination = os.path.join(txt_path, f"{new_filename}.txt")
            shutil.copy2(source_file, txt_destination)
            
            # Read the content of the file
            with open(source_file, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Format the content and create Markdown
            formatted_content = format_content(content)
            markdown_content = create_markdown(formatted_content, new_filename)
            
            # Save as Markdown
            markdown_destination = os.path.join(processed_markdown_path, f"{new_filename}.md")
            with open(markdown_destination, 'w', encoding='utf-8') as file:
                file.write(markdown_content)
            
            print(f"Processed: {filename} -> {new_filename}.txt and {new_filename}.md")
            
            # Remove the original file from source_path
            os.remove(source_file)

def move_html_files():
    # Get a list of existing files in the destination folder
    existing_files = set(os.path.splitext(f)[0].rsplit('-', 2)[0] for f in os.listdir(original_html_path) if f.endswith('.html'))

    for filename in os.listdir(html_source_path):
        if filename.endswith(".html"):
            source_file = os.path.join(html_source_path, filename)
            new_filename = format_filename(filename)
            
            # Get the base name without date and extension
            base_name = os.path.splitext(new_filename)[0].rsplit('-', 2)[0]
            
            # Check if a file with this base name already exists in the destination
            if base_name not in existing_files:
                destination = os.path.join(original_html_path, f"{new_filename}.html")
                shutil.copy2(source_file, destination)
                print(f"Moved: {filename} -> {new_filename}.html")
                
                # Add the base name to the set of existing files
                existing_files.add(base_name)
            else:
                print(f"Skipped: {filename} (already exists in destination)")

def main():
    # Ensure all directories exist
    for directory in [txt_path, processed_markdown_path, original_html_path]:
        ensure_dir(directory)
    
    # Process text files
    process_txt_files()
    
    # Move HTML files
    move_html_files()

if __name__ == "__main__":
    main()
