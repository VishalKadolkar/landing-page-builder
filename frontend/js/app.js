let currentImage = '';
let currentPrompt = '';

async function generateImage() {
  const description = document.getElementById('description').value.trim();
  const businessName = document.getElementById('businessName').value.trim();
  const style = document.getElementById('style').value;
  const colors = document.getElementById('colors').value.trim();

  if (!description) {
    showError('Please describe your business first!');
    return;
  }

  setLoading(true);
  hideError();
  hideActions();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, businessName, style, colors })
    });

    const data = await response.json();

    if (!data.success) {
      showError('Generation failed: ' + (data.error || 'Unknown error'));
      return;
    }

    currentImage = data.image;
    currentPrompt = data.prompt;
    renderPreview(data.image);
    showActions();
    showPrompt(data.prompt);

  } catch (err) {
    showError('Could not connect to server. Make sure both servers are running.');
  } finally {
    setLoading(false);
  }
}

function renderPreview(base64Image) {
  const container = document.getElementById('previewContainer');
  container.innerHTML = `
    <img 
      src="data:image/png;base64,${base64Image}" 
      alt="Generated Landing Page" 
      style="max-width:100%; max-height:100%; object-fit:contain; border-radius:12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);"
    />
  `;
}

function downloadImage() {
  if (!currentImage) return;
  const link = document.createElement('a');
  const name = document.getElementById('businessName').value || 'landing-page';
  link.href = 'data:image/png;base64,' + currentImage;
  link.download = name.toLowerCase().replace(/\s+/g, '-') + '-mockup.png';
  link.click();
}

function copyPrompt() {
  if (!currentPrompt) return;
  navigator.clipboard.writeText(currentPrompt).then(() => {
    alert('Prompt copied to clipboard! You can paste this into Midjourney, DALL-E, or any AI image tool.');
  });
}

function showPrompt(prompt) {
  const box = document.getElementById('promptBox');
  const text = document.getElementById('promptText');
  text.textContent = prompt;
  box.style.display = 'block';
}

function setLoading(on) {
  const btn = document.getElementById('generateBtn');
  const box = document.getElementById('statusBox');
  btn.disabled = on;
  btn.textContent = on ? '⏳ Generating...' : '✨ Generate Landing Page Image';
  box.style.display = on ? 'flex' : 'none';
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = 'Error: ' + msg;
  box.style.display = 'block';
}

function hideError() {
  document.getElementById('errorBox').style.display = 'none';
}

function showActions() {
  document.getElementById('actionsBox').style.display = 'block';
}

function hideActions() {
  document.getElementById('actionsBox').style.display = 'none';
  document.getElementById('promptBox').style.display = 'none';
}