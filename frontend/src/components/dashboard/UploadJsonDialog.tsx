import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

interface UploadDialogProps {
    onUploadSuccess?: () => void;
}

export function UploadJsonDialog({ onUploadSuccess }: UploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        inserted?: number;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type - accept JSON or CSV
        const isJson = selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json');
        const isCsv = selectedFile.type === 'text/csv' || selectedFile.type === 'application/csv' || selectedFile.name.endsWith('.csv');

        if (!isJson && !isCsv) {
            setResult({
                success: false,
                message: 'Please select a JSON or CSV file',
            });
            return;
        }

        setFile(selectedFile);
        setResult(null);
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
            });

            const data = await response.json();

            if (response.ok) {
                setResult({
                    success: true,
                    message: data.message || 'Upload successful',
                    inserted: data.inserted,
                });
                setFile(null);

                // Reset file input
                const fileInput = document.getElementById('json-file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                // Call success callback and close dialog after 2 seconds
                setTimeout(() => {
                    onUploadSuccess?.();
                    setOpen(false);
                    setResult(null);
                }, 2000);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-blue-600" />
                        Upload Log File
                    </DialogTitle>
                    <DialogDescription>
                        Upload a JSON or CSV file containing log events to ingest into the system.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* File Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="json-file-input"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Select File (JSON or CSV)
                        </label>
                        <input
                            id="json-file-input"
                            type="file"
                            accept=".json,.csv,application/json,text/csv,application/csv"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {file && (
                            <p className="text-xs text-muted-foreground">
                                Selected: <span className="font-medium">{file.name}</span>{' '}
                                ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {/* Upload Button */}
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload & Ingest Logs
                            </>
                        )}
                    </Button>

                    {/* Result Alert */}
                    {result && (
                        <Alert variant={result.success ? 'default' : 'destructive'}>
                            <div className="flex items-start gap-2">
                                {result.success ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5" />
                                )}
                                <AlertDescription className="flex-1">
                                    {result.message}
                                    {result.inserted && (
                                        <div className="mt-1">
                                            Successfully ingested <strong>{result.inserted}</strong> events
                                        </div>
                                    )}
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}

                    {/* Format Example */}
                    <div className="mt-4 rounded-lg border bg-muted/50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                            JSON Format Example:
                        </p>
                        <pre className="text-xs overflow-x-auto">
                            {`JSON Format:
                            [
                            {
                                "tenant": "demo.com",
                                "source": "api",
                                "event_type": "login_success",
                                "user": "username",
                                "ip": "192.168.1.1"
                            }
                            ]

                            CSV Format:
                            tenant,source,event_type,user,ip
                            demo.com,api,login_success,username,192.168.1.1`}
                                                    </pre>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Required: <code className="text-xs">tenant</code>, <code className="text-xs">source</code>
                                                    </p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                );
                            }
