document.getElementById('modUpload').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  const formData = new FormData();
  files.forEach(file => formData.append('mods', file));

  const res = await fetch('/upload', { method: 'POST', body: formData });
  const mods = await res.json();
  const container = document.getElementById('modList');
  container.innerHTML = '';

  mods.forEach(mod => {
    const div = document.createElement('div');
    div.innerHTML = `${mod.name} - <b>${mod.isNewest ? 'Newest' : 'Old'}</b> - 
      <a href="/download/${mod.filename}">Download</a>`;
    container.appendChild(div);
  });
});
