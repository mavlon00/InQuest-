const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/5/53/NIGERIAN_DRIVER.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/cd/Keke_driver_lagos.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/04/A_keke_driver_in_lagos.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/9/9e/Keke_driver.jpg"
];

(async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${res.status} - ${url}`);
    } catch (e) {
      console.log(`ERROR - ${url}`);
    }
  }
})();
