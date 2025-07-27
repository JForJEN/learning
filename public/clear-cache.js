// Clear cache script
console.log('🧹 Clearing browser cache...');

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('🗑️ Deleted cache:', name);
    }
  });
}

// Force reload without cache
window.location.reload(true); 