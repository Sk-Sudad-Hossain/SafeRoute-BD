/**
 * Upload utility for handling image uploads
 */

const API_BASE = "http://localhost:1089/api";

export async function uploadImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}
