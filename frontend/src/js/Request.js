export default function runRequest(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      headers,
      data,
      responseType,
      method,
    } = options;

    const url = 'http://localhost:7070/';

    const params = new URLSearchParams();

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        params.append(key, data[key]);
      }
    }

    const xhr = new XMLHttpRequest();

    if (method === 'GET') {
      xhr.open('GET', `${url}?${params}`);
    } else {
      xhr.open('POST', `${url}?${params}`);
    }

    for (const header in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, header)) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }
    xhr.responseType = responseType;

    if (method === 'GET') {
      xhr.send();
    } else {
      xhr.send(params);
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 500) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Ошибка ${xhr.status}\n${xhr.statusText}`));
      }
    });
  });
}
