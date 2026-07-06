document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('settingsForm');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const fixedDistanceGroup = document.getElementById('fixedDistanceGroup');
  const progressiveGroup = document.getElementById('progressiveGroup');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get({
    mode: 'default',
    fixedDistance: 5,
    progDouble: 5,
    progTriple: 15,
    progQuadruple: 30,
    progAdditional: 30
  }, function(items) {
    document.querySelector(`input[name="mode"][value="${items.mode}"]`).checked = true;
    document.getElementById('fixedDistance').value = items.fixedDistance;
    document.getElementById('progDouble').value = items.progDouble;
    document.getElementById('progTriple').value = items.progTriple;
    document.getElementById('progQuadruple').value = items.progQuadruple;
    document.getElementById('progAdditional').value = items.progAdditional;
    updateVisibility(items.mode);
  });

  function updateVisibility(mode) {
    fixedDistanceGroup.style.display = (mode === 'fixed') ? 'block' : 'none';
    progressiveGroup.style.display = (mode === 'progressive') ? 'block' : 'none';
  }

  modeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      updateVisibility(this.value);
    });
  });

  // Save settings
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const settings = {
      mode: mode,
      fixedDistance: parseInt(document.getElementById('fixedDistance').value, 10) || 5,
      progDouble: parseInt(document.getElementById('progDouble').value, 10) || 5,
      progTriple: parseInt(document.getElementById('progTriple').value, 10) || 15,
      progQuadruple: parseInt(document.getElementById('progQuadruple').value, 10) || 30,
      progAdditional: parseInt(document.getElementById('progAdditional').value, 10) || 30
    };
    chrome.storage.sync.set(settings, function() {
      statusDiv.textContent = 'Settings saved.';
      setTimeout(() => statusDiv.textContent = '', 2000);
    });
  });
});