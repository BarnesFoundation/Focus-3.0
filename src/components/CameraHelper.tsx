export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    // Create a new image
    const image = new Image();

    // Bind an event listener on the load to call the `resolve` function
    image.onload = resolve;

    // If the image fails to be downloaded, we don't want the whole system to collapse so we `resolve` instead of `reject`, even on error
    image.onerror = resolve;
    image.src = url;
  });
};

export const resetScanCounter = () => {};
