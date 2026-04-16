export const API_BASE_URL = "http://localhost:1089/api";

const getToken = () => localStorage.getItem("safepath-token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: getToken() ? `Bearer ${getToken()}` : "",
});

export async function apiGet(url) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function apiPost(url, data) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function apiPatch(url, data) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function apiUpload(url, formData) {
  const token = getToken();
  const headers = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function apiDelete(url) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
