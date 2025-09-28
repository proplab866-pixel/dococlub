"use client";

import { useEffect, useState } from "react";

export default function PaymentGatewayPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Fetch QR Code (direct image from API)
    const fetchQRCode = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/v1/qrcode/getqrcode");
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setQrCodeUrl(url);
            } else {
                setQrCodeUrl(null);
            }
        } catch (err) {
            console.error("Error fetching QR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQRCode();
    }, []);

    // 🔹 Handle file input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // 🔹 Upload or update QR code
    const handleSave = async () => {
        if (!file) return;
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", file); // <-- append actual file, not URL

            const method = qrCodeUrl ? "PUT" : "POST";
            const res = await fetch(
                method === "PUT"
                    ? "/api/v1/qrcode/updateqrcode"
                    : "/api/v1/qrcode/postqrcode",
                {
                    method,
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.success) {
                // alert("QR Code saved successfully!");
                setPreview(null);
                setFile(null);
                fetchQRCode(); // reload updated QR
            } else {
                console.log(data.error);
                // alert(data.error || "Failed to save QR Code");
            }
        } catch (err) {
            console.error("QR Save error:", err);
            alert("Error saving QR Code");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
                Payment Gateway
            </h1>

            {/* Current QR Code */}
            <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700">Current QR Code</h2>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : qrCodeUrl ? (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain border rounded-lg shadow"
                    />
                ) : (
                    <p className="text-gray-500">No QR code uploaded yet</p>
                )}
            </div>

            {/* Upload / Update QR */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    {qrCodeUrl ? "Update QR Code" : "Add QR Code"}
                </h2>

                <input type="file" accept="image/*" onChange={handleFileChange} />

                {preview && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Preview:
                        </h3>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-48 h-48 object-contain border rounded-lg shadow"
                        />
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={!file || loading}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save QR Code"}
                </button>
            </div>
        </div>
    );
}
