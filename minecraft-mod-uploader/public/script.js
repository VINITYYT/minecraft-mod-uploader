const modList = document.getElementById('modList');
const uploadInput = document.getElementById('modUpload');

uploadInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  const formData = new FormData();
  files.forEach(f => formData.append('mods', f));
  await fetch('/upload', { method: 'POST', body: formData });
  loadMods();
});

async function loadMods() {
  const res = await fetch('/mods');
  const mods = await res.json();
  modList.innerHTML = '';

  // Download all button
  const all = document.createElement('div');
  all.innerHTML = `<a href="/download-all" download="mods.zip">Download All Mods (ZIP)</a>`;
  modList.appendChild(all);

  mods.forEach(mod => {
    const el = document.createElement('div');
    el.innerHTML = `${mod.name} - <strong>${mod.isNewest ? 'Newest' : 'Old'}</strong> 
      - <a href="/download/${mod.name}">Download</a>`;
    modList.appendChild(el);
  });
}

window.addEventListener('DOMContentLoaded', loadMods);
