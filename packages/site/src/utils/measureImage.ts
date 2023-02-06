export async function measureImage(data: ArrayBuffer) {
  const image = new Image();
  image.src = URL.createObjectURL(new Blob([data]));

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  return {
    width() {
      return image.width;
    },
    height() {
      return image.height;
    },
  };
}
