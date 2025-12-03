import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

export function FileUploadIngestion() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        inserted?: number;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file type
            if (selectedFile.type !== 'application/json') {
                setResult({
                    success: false,
                    message: 'Please select a JSON file',
                });
                return;
            }

            setFile(selectedFile);
            setResult(null); // Clear previous result
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setResult({
                success: false,
                message: 'Please select a file first',
            });
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/ingest/file`, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - browser will set it automatically with boundary
            });

            const data = await response.json();

            if (response.ok) {
                setResult({
                    success: true,
                    message: data.message || 'Upload successful',
                    inserted: data.inserted,
                });
                setFile(null); // Clear file selection
                // Reset file input
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                setResult({
                    success: false,
                    message: data.message || data.error || 'Upload failed',
                });
            }
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Network error occurred',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    JSON Batch File Upload
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Input */}
                <div className="space-y-2">
                    <label
                        htmlFor="file-input"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Select JSON File
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="file-input"
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                cursor-pointer"
                        />
                    </div>
                    {file && (
                        <p className="text-sm text-gray-600">
                            Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                    )}
                </div>

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload & Ingest Logs'}
                </Button>

                {/* Result Message */}
                {result && (
                    <div
                        className={`p-4 rounded-md border ${result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}
                    >
                        <div className="flex items-start gap-2">
                            {result.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p
                                    className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                                        }`}
                                >
                                    {result.message}
                                </p>
                                {result.inserted && (
                                    <p className="text-sm text-green-700 mt-1">
                                        Successfully ingested {result.inserted} log events
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">JSON Format:</h4>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                        {`[
  {
    "tenant": "Lumiq-thailand.com",
    "source": "api",
    "event_type": "login_success",
    "user": "username",
    "ip": "192.168.1.1",
    "url": "/path",
    "method": "POST",
    "status_code": 200
  }
]`}
                    </pre>
                    <p className="text-xs text-gray-600 mt-2">
                        <strong>Required fields:</strong> tenant, event_type, user
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
