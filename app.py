from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import pandas as pd
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            df = pd.read_excel(filepath)
            columns = list(df.columns)
            return jsonify({
                'success': True,
                'filename': filename,
                'columns': columns
            })
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    
    return jsonify({'success': False, 'message': 'Invalid file type'})

@app.route('/sort', methods=['POST'])
def sort_columns():
    data = request.get_json()
    filename = data.get('filename')
    columns = data.get('columns')
    
    if not filename or not columns:
        return jsonify({'success': False, 'message': 'Missing parameters'})
    
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df = pd.read_excel(filepath)
        
        # Sort by selected columns
        df = df.sort_values(by=columns)
        
        # Save sorted file
        sorted_filename = f"sorted_{filename}"
        sorted_filepath = os.path.join(app.config['UPLOAD_FOLDER'], sorted_filename)
        df.to_excel(sorted_filepath, index=False)
        
        return jsonify({
            'success': True,
            'filename': sorted_filename
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        as_attachment=True
    )

if __name__ == '__main__':
    app.run(debug=True)
