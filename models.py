import json
import os
import zipfile

def process_original_file(input_path, output_path):
    with open(input_path, 'r') as file:
        data = json.load(file)
    models = data["data"]
    model_list = {model["id"]: model["name"] for model in models}
    with open(output_path, 'w') as output_file:
        json.dump(model_list, output_file, indent=4)

def reverse_json_pairs(input_path, output_path):
    with open(input_path, 'r') as file:
        models = json.load(file)
    reversed_json_content = {value: key for key, value in models.items()}
    with open(output_path, 'w') as reversed_json_file:
        json.dump(reversed_json_content, reversed_json_file, indent=4)

def generate_html_buttons(input_path, output_path):
    with open(input_path, 'r') as file:
        models = json.load(file)
    def generate_button(key, value):
        data_value = key
        button_text = value
        button_id = 'open-router-model-' + key.replace('/', '-').replace(':', '-')
        return f'<button id="{button_id}" data-value="{data_value}">{button_text}</button>'
    html_buttons = [generate_button(key, value) for key, value in models.items()]
    html_output = '\n'.join(html_buttons)
    with open(output_path, 'w') as html_file:
        html_file.write(html_output)

def replace_model_names_with_descriptions(input_path, output_path):
    with open(input_path, 'r') as file:
        data = json.load(file)
    models = data["data"]
    model_list_with_descriptions = {model["id"]: model["description"] for model in models}
    with open(output_path, 'w') as output_file:
        json.dump(model_list_with_descriptions, output_file, indent=4)

def generate_js_event_listeners_for_selection(input_path, original_path, output_path):
    with open(input_path, 'r') as file:
        model_descriptions = json.load(file)
    with open(original_path, 'r') as file:
        original_model_list = json.load(file)
    def generate_event_listener(model_id):
        element_id = 'open-router-model-' + model_id.replace('/', '-').replace(':', '-')
        return f"document.getElementById('{element_id}').addEventListener('click', () => selectModel('{model_id}'));"
    js_event_listeners = [generate_event_listener(model_id) for model_id in original_model_list.keys()]
    js_output = '\n'.join(js_event_listeners)
    with open(output_path, 'w') as js_file:
        js_file.write(js_output)

def generate_js_event_listeners_for_descriptions(input_path, original_path, output_path):
    with open(input_path, 'r') as file:
        model_descriptions = json.load(file)
    with open(original_path, 'r') as file:
        original_model_list = json.load(file)
    def generate_event_listener(model_id):
        element_id = 'open-router-model-' + model_id.replace('/', '-').replace(':', '-')
        return f"document.getElementById('{element_id}').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['{model_id}'], event.currentTarget));"
    js_event_listeners = [generate_event_listener(model_id) for model_id in original_model_list.keys()]
    js_output = '\n'.join(js_event_listeners)
    with open(output_path, 'w') as js_file:
        js_file.write(js_output)

def create_zip_file(output_dir, zip_path, files_to_include):
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for file in files_to_include:
            file_path = os.path.join(output_dir, file)
            zipf.write(file_path, os.path.relpath(file_path, output_dir))

if __name__ == "__main__":
    original_file_path = 'models.json'
    output_dir = 'output_files'

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    model_list_path = os.path.join(output_dir, 'output_model_list.json')
    reversed_model_list_path = os.path.join(output_dir, 'reversed_model_list.json')
    html_buttons_path = os.path.join(output_dir, 'models_buttons.html')
    model_list_with_descriptions_path = os.path.join(output_dir, 'output_model_list_with_descriptions.json')
    js_event_listeners_selection_path = os.path.join(output_dir, 'model_event_listeners_corrected.js')
    js_event_listeners_descriptions_path = os.path.join(output_dir, 'model_event_listeners_with_descriptions_corrected.js')
    zip_file_path = os.path.join(output_dir, 'output_files.zip')

    process_original_file(original_file_path, model_list_path)
    reverse_json_pairs(model_list_path, reversed_model_list_path)
    generate_html_buttons(model_list_path, html_buttons_path)
    replace_model_names_with_descriptions(original_file_path, model_list_with_descriptions_path)
    generate_js_event_listeners_for_selection(model_list_with_descriptions_path, model_list_path, js_event_listeners_selection_path)
    generate_js_event_listeners_for_descriptions(model_list_with_descriptions_path, model_list_path, js_event_listeners_descriptions_path)

    files_to_include = [
        'output_model_list.json',
        'reversed_model_list.json',
        'models_buttons.html',
        'output_model_list_with_descriptions.json',
        'model_event_listeners_corrected.js',
        'model_event_listeners_with_descriptions_corrected.js'
    ]

    create_zip_file(output_dir, zip_file_path, files_to_include)

    print(f"All files have been processed and zipped into {zip_file_path}")