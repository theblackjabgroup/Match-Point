let scrollDistance = parseFloat(localStorage.getItem('scrollDistance')) || 0;
let prevScrollPosition = { x: window.scrollX, y: window.scrollY };

const updateScrollDistance = () => {
  const currentScrollPosition = { x: window.scrollX, y: window.scrollY };
  const deltaX = currentScrollPosition.x - prevScrollPosition.x;
  const deltaY = currentScrollPosition.y - prevScrollPosition.y;
  const incrementalDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2) / 100000; 
  scrollDistance += incrementalDistance;
  localStorage.setItem('scrollDistance', scrollDistance);

  document.getElementById('scrollDistance').textContent = scrollDistance.toFixed(2);

  prevScrollPosition = currentScrollPosition;
};

window.addEventListener('scroll', updateScrollDistance);

// Initialize display
document.getElementById('scrollDistance').textContent = scrollDistance.toFixed(2);
