var productNameArr = [];
var reqProductArr = [];

const maxRetries = 3;

function fetchWithRetry(url, options, retries) {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch((error) => {
      if (retries > 0) {
        console.warn(`Retrying... ${retries} attempts left`);
        return fetchWithRetry(url, options, retries - 1);
      } else {
        throw error;
      }
    });
}

async function checkoutProduct(productVariantId) {
  let formData = {
    items: [
      {
        id: productVariantId,
        quantity: 1,
      },
    ],
  };

  const clearCartOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const addCartOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  };

  fetchWithRetry(window.Shopify.routes.root + 'cart/clear.js', clearCartOptions, maxRetries)
    .then(() => {
      return fetchWithRetry(window.Shopify.routes.root + 'cart/add.js', addCartOptions, maxRetries);
    })
    .then((data) => {
      console.log('Success:', data);
      window.location.href = '/checkout/?ref=occ';
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

async function fetchProduct(productName) {
  //   const productId = this.products.shift();
  try {
    const response = await fetch(`/products/${productName}.js`);
    const product = await response.json();
    console.log('product ', product);
    return product;
  } catch {
    console.log('Error NIkhil');
  }
}

function removeParam(sourceURL) {
  // Create a new URL object
  const parsedUrl = new URL(sourceURL);
  const params = {};

  // Extract parameters
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  parsedUrl.search = '';
  return {
    urlWithoutParams: parsedUrl.toString(),
    params: params,
  };
}
function arrSort(orderArray, arrayToSort) {
  arrayToSort.sort((a, b) => {
    console.log('a ', a.title, ' b ', b.title);
    const indexA = orderArray.indexOf(a.handle);
    const indexB = orderArray.indexOf(b.handle);

    // If both elements are in orderArray, compare their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one element is in orderArray, it should come first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither element is in orderArray, sort them alphabetically
    return 1;
  });
}

function identifyProductfromReq() {
  console.log("location.href.indexOf('products') ", location.href.indexOf('products')); //
  if (sessionStorage.getItem('productNameArr')) {
    const myArrayString = sessionStorage.getItem('productNameArr');
    productNameArr = JSON.parse(myArrayString);
  }
  console.log('productNameArr before', productNameArr);
  if (location.href.indexOf('products') != -1) {
    console.log('In product page');

    const currentPageUrl = removeParam(window.location.href);
    const parsedUrl = new URL(currentPageUrl.urlWithoutParams);

    const segments = parsedUrl.pathname.split('/');
    console.log('productNameArr ', productNameArr);
    const pro = segments.filter((segment) => segment).pop();
    if (productNameArr && !productNameArr.includes(pro)) {
      if (productNameArr.length == 3) {
        productNameArr.pop();
      }
      productNameArr.unshift(pro);
    }
    sessionStorage.setItem('productNameArr', JSON.stringify(productNameArr));
  }

  // const shopName = extractShopifyStoreName(window.location.href);
  // console.log("shopName ", shopName);
  console.log('Variable already set. Value:', productNameArr);
  console.log('productNameArr ', productNameArr);
  const fetchPromises = [];

  if (productNameArr) {
    productNameArr.forEach((productName) => {
      if (productName && productName != 'undefined') {
        const fetchPromise = fetchProduct(productName)
          .then((response) => {
            reqProductArr.unshift(response);
            console.log('reqProductArrfetch before ', reqProductArr);
          })
          .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
          });
        fetchPromises.push(fetchPromise);
      }
    });

    Promise.all(fetchPromises)
      .then((edges) => {
        arrSort(productNameArr, reqProductArr);
        add_banner(reqProductArr);
      })
      .catch((error) => {
        console.error('Error fetching JSON in identifyProductfromReq:', error);
      });
  }
}

function add_banner(reqProductArr) {
  var widgetDiv = document.getElementById('recently-viewed-widget');

  if (widgetDiv) {
    var displayPosition = widgetDiv.getAttribute('data-widget-display');
    var top = widgetDiv.getAttribute('data-widget-top');
    var left = widgetDiv.getAttribute('data-widget-left');

    console.log('widgetDiv ', widgetDiv, 'dis ', displayPosition);
    console.log('reqProductArr ', reqProductArr);
    var productDesc = '<p>This is a sample product</p>\n\x3C!---->';
    var productPrice = '100';
    if (location.href.indexOf('cart') == -1 && productNameArr) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = productDesc;

      const descriptionText = tempDiv.textContent || tempDiv.innerText || '';

      console.log('productDesc ', descriptionText, ' productPrice ', productPrice);
      //  const headerTag = document.querySelectorAll('[class*="header"]')[0];
      const headerTag = document.getElementsByClassName('header-wrapper');
      console.log('Header Tag:', headerTag[0], headerTag[0].clientHeight, headerTag[0].scrollHeight);

      // Create a new div element
      const parentDiv = document.createElement('div');
      parentDiv.classList.add('bb-container');

      for (let i = 0; i < reqProductArr.length; i++) {
        const childDiv = document.createElement('div');
        childDiv.classList.add('bb-inner-container');
        const newDiv = document.createElement('div');
        newDiv.className = 'bb-banner';
        // Add some content to the new div
        newDiv.textContent = reqProductArr[i].title;
        const buttonDiv = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = 'Buy Now';
        button.classList.add('bb-inner-button');
        const pro_var_id = reqProductArr[i].variants[0].id;
        console.log('productVariantId ', pro_var_id);
        button.addEventListener('click', () => {
          checkoutProduct(pro_var_id);
        });
        buttonDiv.appendChild(button);
        childDiv.appendChild(newDiv);
        const priceDiv = document.createElement('div');
        priceDiv.className = 'bb-banner';
        priceDiv.textContent = (reqProductArr[i].price / 100).toFixed(2);
        newDiv.insertAdjacentElement('afterend', buttonDiv);
        newDiv.insertAdjacentElement('afterend', priceDiv);
        console.log('childDiv ', childDiv);
        parentDiv.appendChild(childDiv);

        if (i != reqProductArr.length - 1) {
          const lineDiv = document.createElement('div');
          const lineChildDiv = document.createElement('div');
          lineDiv.className = 'bb-line';
          lineChildDiv.className = 'bb-child-line';
          lineDiv.appendChild(lineChildDiv);
          parentDiv.appendChild(lineDiv);
        } else {
          childDiv.style.marginBottom = '0px';
        }
      }
      // Insert the new div at the top of the body
      if (headerTag[0]) {
        var posTop = headerTag[0].clientHeight + parseInt(top, 10) + 5;
        if (displayPosition == 'Top-Left') {
          parentDiv.style.top = posTop + 'px';
          parentDiv.style.left = left + 'px';
        }
        if (displayPosition == 'Top-Right') {
          parentDiv.style.top = posTop + 'px';
          parentDiv.style.right = '10px';
          /*
                if (left != '0') {
                    parentDiv.style.left = left + "px";
                }
                */
        }
        if (displayPosition == 'Bottom-Left') {
          parentDiv.style.bottom = '10px';
          parentDiv.style.left = left + 'px';
          /*
                if (top != '0') {
                    parentDiv.style.top = posTop + "px";;
                }
                */
        }
        if (displayPosition == 'Bottom-Right') {
          parentDiv.style.bottom = '10px';
          parentDiv.style.right = '10px';
          /*
                if (top != '0') {
                    parentDiv.style.top = posTop + "px";;
                }
                if (left != '0') {
                    parentDiv.style.left = left + "px";
                }
                */
        }
        headerTag[0].insertAdjacentElement('afterend', parentDiv);
      } else {
        parentDiv.style.top = top + 'px';
        parentDiv.style.left = left + 'px';
        document.insertBefore(document.firstChild, parentDiv);
      }
    }
  }
}

identifyProductfromReq();
