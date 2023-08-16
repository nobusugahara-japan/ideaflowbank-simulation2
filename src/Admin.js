import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useGlobalData } from './GlobalDataContext';

const Admin = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [message, setMessage] = useState('');
    const { data, setData } = useGlobalData();

    const onDrop = useCallback((acceptedFiles) => {
        setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
        // ファイルの内容を読み取ります
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = JSON.parse(reader.result);
                setData(prevData => [...prevData, ...result]);
            };
            reader.readAsText(file);
        });
        
        setMessage('File(s) uploaded successfully!');
    }, [uploadedFiles]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: ".json"
    });

    return (
        <div>
            <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center' }}>
                <input {...getInputProps()} />
                <p>Drag & drop some files here, or click to select files</p>
            </div>
            
            {message && <p>{message}</p>}
            
            <ul>
                {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default Admin;


