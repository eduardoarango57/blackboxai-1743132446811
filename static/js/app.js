document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const sortingSection = document.getElementById('sortingSection');
    const downloadSection = document.getElementById('downloadSection');
    const columnCheckboxes = document.getElementById('columnCheckboxes');
    const sortBtn = document.getElementById('sortBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let uploadedFileName = '';
    let sortedFileName = '';

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    uploadedFileName = data.filename;
                    displayColumns(data.columns);
                    sortingSection.classList.remove('d-none');
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during upload');
            });
        }
    });

    function displayColumns(columns) {
        columnCheckboxes.innerHTML = '';
        columns.forEach((column, index) => {
            const div = document.createElement('div');
            div.className = 'form-check form-switch mb-2';
            
            const input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'checkbox';
            input.id = `col-${index}`;
            input.value = column;
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `col-${index}`;
            label.textContent = column;
            
            div.appendChild(input);
            div.appendChild(label);
            columnCheckboxes.appendChild(div);
        });
    }

    sortBtn.addEventListener('click', function() {
        const selectedColumns = Array.from(document.querySelectorAll('#columnCheckboxes input:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedColumns.length === 0) {
            alert('Please select at least one column to sort');
            return;
        }

        fetch('/sort', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: uploadedFileName,
                columns: selectedColumns
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sortedFileName = data.filename;
                downloadBtn.href = `/download/${sortedFileName}`;
                downloadSection.classList.remove('d-none');
                alert('File sorted successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during sorting');
        });
    });
});