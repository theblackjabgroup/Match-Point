let scrollDistance = parseFloat(localStorage.getItem('scrollDistance')) || "";
let prevScrollPosition = { x: window.scrollX, y: window.scrollY };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scrollDistance').textContent = scrollDistance.toFixed(2);
  document.getElementById('scrollDistanceWidget').textContent =  scrollDistance.toFixed(3);
})


const updateElements = (distance) => {
  document.getElementById('scrollDistance').textContent = distance.toFixed(2);
  document.getElementById('scrollDistanceWidget').textContent = distance.toFixed(3);
};

const updateScrollDistance = () => {
  const currentScrollPosition = { x: window.scrollX, y: window.scrollY };
  const deltaX = currentScrollPosition.x - prevScrollPosition.x;
  const deltaY = currentScrollPosition.y - prevScrollPosition.y;
  const incrementalDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2) / 1000000;
  scrollDistance += incrementalDistance;
  localStorage.setItem('scrollDistance', scrollDistance);

  updateElements(scrollDistance);

  prevScrollPosition = currentScrollPosition;
};

window.addEventListener('scroll', updateScrollDistance);

document.getElementById('scroll-to-bottom').addEventListener('click', () => {
  window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'})
})
