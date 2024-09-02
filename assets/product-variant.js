const slides_wrapper = document.querySelector('.product-variants-wrapper'),
  slides = document.querySelectorAll('.slides'),
  images = document.querySelectorAll('.slides img');

slides.forEach((slide, i) => {
  slide.onclick = () => {
    slides_wrapper.style.transform = `rotateZ(-${(360 / slides.length) * i}deg)`;
    images.forEach((img, index) => {
      img.style.setProperty('--current_variant', 2);
      img.classList.remove('active');
    });

    slide.querySelector('img').classList.add('active');
  };
  if(i === 0){
    slide.querySelector('img').classList.add('active');
  } 
});
